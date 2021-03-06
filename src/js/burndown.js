var Burndown = Burndown || {};

var points_regex = /((?:^|\s))\((\x3f|\d*\.?\d+)(\))\s?/m;

Burndown.oc = [];
Burndown.cc = [];

// Card statuses
Burndown.ALL = 0;
Burndown.OPEN = 1;
Burndown.CLOSED = 2;
Burndown.UNKNOWN = 3;

// Some variables for keeping information about the 
// tickets and stuff.
Burndown.allcards = [];
Burndown.stories = [];

Burndown.initialised = false;

Burndown.pointsOnCard = function (card) {
    var points = $(".point-count", card);
    if (!points || points.length==0) {
        // The Burndown for Trello plugin has not fired yet
        // so check the title for points in it.
        var title = $(".js-card-name", card)[0].childNodes[1].textContent;
        var parsedpts = title.match(points_regex)
        var pts = parsedpts?parseInt(parsedpts[2]):0;
        if (pts === 0) {
            return 0;
        }
    } else {
        var pts = parseInt($(points).text());
        if (!isNaN(pts)) {
            return pts;
        } else {
            return 0;
        }
    }
}

Burndown.storyColourOnCard = function(card) {
    var labels = $(".card-label", card);
    if (labels.length === 0) {
        return "scm-no-label";
    }
    if (labels.length > 1) {
        // TODO: Support multiple labels properly
        return "scm-multi-label";
    }
    // The label colour is currently always the 
    // second at the moment.
    return labels[0].classList[1];
}

Burndown.getCardId = function(card) {
    return $(".card-short-id", card).text();
}

Burndown.Card = function(cardhtml) {
    this.id = Burndown.getCardId(cardhtml);
    this.points = Burndown.pointsOnCard(cardhtml);
    this.story = Burndown.storyColourOnCard(cardhtml);
    var columnObj = cardhtml.closest("#board .list")[0]
    this.column = $(".list-header h2", columnObj)[0].childNodes[0].textContent;
    if (Burndown.oc.indexOf(this.column) !== -1) {
        this.status = Burndown.OPEN;
    } else if (Burndown.cc.indexOf(this.column) !== -1) {
        this.status = Burndown.CLOSED;
    } else {
        this.status = Burndown.UNKNOWN;
    }
}

Burndown.getCardsWhere = function(attr, value, cards) {
    // Return Card objects whose attr (id, points, story, status)
    // equals the value passed
    // Optionally accepts a list of cards to use instead of all cards
    if (typeof(cards) === 'undefined') cards = Burndown.allcards;
    var matches = [];
    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        if (card[attr] === value) {
            matches.push(card);
        }
    }
    return matches;
}

Burndown.getStatsForCards = function(cards) {
    /* Takes a list of cards, and returns:
        {
            'cards': <total cards>
            'points': <total points on cards>
            'unpointed': <total unpointed cards>
        }
     */
    var totals = {
        "cards": 0,
        "points": 0,
        "unpointed": 0
    }
    
    if (typeof(cards) === 'undefined') {
        return totals;
    }
    
    totals['cards'] = cards.length;
    
    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        totals['points'] += card.points;
        if (card.points === 0) {
            totals['unpointed'] += 1;
        }
    }
    return totals;
}

Burndown.storyHeadlinesHTML = function(status) {
    var html = "";
    var cardsinstatus = Burndown.allcards;
    if (status !== Burndown.ALL) {
        // If we are asking for a particular status, get only those cards
        cardsinstatus = Burndown.getCardsWhere("status", status);
    }
    for (var i = 0; i<Burndown.stories.length; i++) {
        var story_colour = Burndown.stories[i];
        // Get cards that match the story colour
        var cards = Burndown.getCardsWhere("story", story_colour, cardsinstatus);
        // If there are no matching cards, skip this block
        if (cards.length == 0) continue;
        // Get the stats for the cards we have
        var story = Burndown.getStatsForCards(cards);
        // Build some HTML for them
        html += "<div class='scm-story-block'>" +
                "<span class='card-label " + story_colour + "'></span>" +
                "<strong>Total:</strong> " + story["cards"] + "<br />" +
                "<strong>Points:</strong> " + story["points"] + "<br />" +
                "<strong>Unpointed:</strong> " + story["unpointed"] +                
                "</div>";
    }
    return html;
}

Burndown.initialiseTopline = function() {
    var menuBars = $(".board-header-btns");
    for (var i=0; i<menuBars.length; i++){
        var menubar = $(menuBars[i]);
        if (menubar.hasClass("left")) {
            // Build my summary info.
            var openCards = Burndown.getStatsForCards(Burndown.getCardsWhere("status", Burndown.OPEN));
            var closedCards = Burndown.getStatsForCards(Burndown.getCardsWhere("status", Burndown.CLOSED));
            var allCards = Burndown.getStatsForCards(Burndown.allcards);
            
            var summary = "<div id='scrum-master-burndown-summary' class='left'>" +
                "<span class='scm-heading'>" + 
                "Remaining: " +
                "</span>" +
                "<span class='scm-points'>" +
                openCards['cards'] + " cards, " +
                openCards['points'] + " points, " +
                openCards['unpointed'] + " unpointed cards." +
                "</span>" +
                "</div>";
            
            menubar.append(summary);
            
            // Build pop-over
            var popover = "<div id='scm-detail-popover'>" + 
                "<div class='scm-popover-block'>" +
                    "<h2>Open Cards</h2>" +
                    "<p>" +
                        "<strong>Total:</strong> " + openCards['cards'] + " | " +
                        "<strong>Points:</strong> " + openCards['points'] + " | " +
                        "<strong>Unpointed:</strong> " + openCards['unpointed'] +
                    "</p>" + 
                    Burndown.storyHeadlinesHTML(Burndown.OPEN) + 
                "</div>" +
                "<div class='scm-popover-block'>" +
                    "<h2>Closed Cards</h2>" +
                    "<p>" +
                        "<strong>Total:</strong> " + closedCards['cards'] +  " | " +
                        "<strong>Points:</strong> " + closedCards['points'] + " | " +
                        "<strong>Unpointed:</strong> " + closedCards['unpointed'] +
                    "</p>" + 
                    Burndown.storyHeadlinesHTML(Burndown.CLOSED) + 
                "</div>" +
                "<div class='scm-popover-block'>" +
                    "<h2>Total Cards</h2>" +
                    "<p>" +
                        "<strong>Total:</strong> " + allCards['cards'] +  " | " +
                        "<strong>Points:</strong> " + allCards['points'] + " | " +
                        "<strong>Unpointed:</strong> " + allCards['unpointed'] +
                    "</p>" + 
                    Burndown.storyHeadlinesHTML(Burndown.ALL) + 
                "</div>" +
                "<a id='scm-refresh' href='#' style='padding-bottom: 1em;'>Sometimes Trello loads TOO slowly, or cards get moved. Click to refresh the stats.</a>" +
            "</div>";
            $("body").append(popover);
            
            // Set a listener to open the popover
            var scmsummary = $("#scrum-master-burndown-summary");
            var scmpos = scmsummary.offset();
            scmsummary.click(function(){
                var scm = $("#scm-detail-popover");
                scm.css({
                   'left': scmpos['left'],
                   'top': scmpos['top'] + 30
                });
                scm.toggle();
            })
        }
    }
}

Burndown.populate = function() {
    // Get all the cards
    var cards = $(".list-card");
    console.log(cards.length);
    // Calculate some points and ting.
    for (var i=0; i<cards.length; i++) {
        var card = new Burndown.Card($(cards[i]));
        if (card.status == Burndown.OPEN || card.status == Burndown.CLOSED) {
            Burndown.allcards.push(card);
        }
        if (Burndown.stories.indexOf(card.story) === -1) {
            console.log(card.story);
            Burndown.stories.push(card.story);
        }
    }
    
    // TODO: Load the activity that happened yesterday.... LATER
    //$.getJSON("https://trello.com/1/boards/51f8e608381199b311000f4f/actions", function(data){
        //console.log(data);
    //});
    
    // Make a little block for my Burndown on the menu
    Burndown.initialiseTopline();
    
    // Register an event on the refresh button.
    $("#scm-refresh").click(function(event) {
        event.preventDefault();
        $("#scrum-master-burndown-summary").remove();
        $("#scm-detail-popover").remove();
        Burndown.allcards = [];
        Burndown.stories = [];
        Burndown.populate();
        // 'Click' the summary
        $("#scrum-master-burndown-summary").click();
    });
    
    Burndown.initialised = true;
}

Burndown.initialise = function() {
    chrome.extension.sendRequest({method: "getLocalStorage", key: "open-columns"}, function(response) {
        var cols = response.data.split(",");
        for (var i=0; i<cols.length; i++) {
            Burndown.oc.push(cols[i].trim()); 
        }
        // Chain the loadings as they're all interdependent
        chrome.extension.sendRequest({method: "getLocalStorage", key: "closed-columns"}, function(response) {
            var cols = response.data.split(",");
            for (var i=0; i<cols.length; i++) {
                Burndown.cc.push(cols[i].trim()); 
            }
            // Now we're done loading, wait for a bit to give Trello burndown a chance
            // then get on with it.
            setTimeout(Burndown.populate, 2000);
        });
    });
}

Burndown.showBurndown = function() {
    
}
$(function(){
    Burndown.initialise();
    // TODO: Register a hook to the refresh link on the summary popup.
});