var Burndown = Burndown || {};

var points_regex = /((?:^|\s))\((\x3f|\d*\.?\d+)(\))\s?/m;

Burndown.oc = [];
Burndown.cc = [];

// Some variables for keeping information about the 
// tickets and stuff.
Burndown.openCards = 0;
Burndown.openPoints = 0;
Burndown.openUnpointed = 0;
Burndown.closedCards = 0;
Burndown.closedPoints = 0;
Burndown.closedUnpointed = 0;
Burndown.totalCards = 0;
Burndown.totalPoints = 0;
Burndown.totalUnpointed = 0;
Burndown.stories = {};

Burndown.initialised = false;

Burndown.storyHeadlinesHTML = function() {
    var html = "";
    console.log(Burndown.stories);
    for (var story_colour in Burndown.stories) {
        console.log("Doing a story");
        var story = Burndown.stories[story_colour];
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
            var summary = "<div id='scrum-master-burndown-summary' class='left'>" +
                "<span class='scm-heading'>" + 
                "Remaining: " +
                "</span>" +
                "<span class='scm-points'>" +
                Burndown.openCards + " cards, " +
                Burndown.openPoints + " points, " +
                Burndown.openUnpointed + " unpointed cards." +
                "</span>" +
                "</div>";
            
            menubar.append(summary);
            
            // Build pop-over
            var popover = "<div id='scm-detail-popover'>" + 
                "<div class='scm-popover-block'>" +
                "<h2>Open Cards</h2>" +
                "<p>" +
                "<strong>Total:</strong> " + Burndown.openCards + "<br />" +
                "<strong>Points:</strong> " + Burndown.openPoints + "<br />" +
                "<strong>Unpointed:</strong> " + Burndown.openUnpointed +
                "</p>" + "</div>" +
                "<div class='scm-popover-block'>" +
                "<h2>Closed Cards</h2>" +
                "<p>" +
                "<strong>Total:</strong> " + Burndown.closedCards +  "<br />" +
                "<strong>Points:</strong> " + Burndown.closedPoints + "<br />" +
                "<strong>Unpointed:</strong> " + Burndown.closedUnpointed +
                "</p>" + "</div>" +
                "<div class='scm-popover-block'>" +
                "<h2>Total Cards</h2>" +
                "<p>" +
                "<strong>Total:</strong> " + Burndown.totalCards +  "<br />" +
                "<strong>Points:</strong> " + Burndown.totalPoints + "<br />" +
                "<strong>Unpointed:</strong> " + Burndown.totalUnpointed +
                "</p>" + "</div>" +
                "<div class='scm-popover-stories'>" +
                "<h2>Stories</h2>" +
                Burndown.storyHeadlinesHTML();
                "</div>"
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

Burndown.pointsOnCard = function (card) {
    var points = $(".point-count", card);
    if (!points || points.length==0) {
        // The Burndown for Trello plugin has not fired yet
        // so check the title for points in it.
        var title = $(".js-card-name", card)[0].childNodes[1].textContent;
        var parsedpts = title.match(points_regex)
        var pts = parsedpts?parseInt(parsedpts[2]):0;
        totals["points"] += pts;
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

Burndown.countCardsAndPointsInColumn = function(column) {
    // Take a column of cards, count the cards and their points, 
    // and any unpointed ones.
    var totals = {
        "cards": 0,
        "points": 0,
        "unpointed": 0
    };
    var cards = $(".list-card", $(column));
    if (cards) {
        totals['cards'] = cards.length;
        for (var i=0; i<cards.length; i++) {
            var card = $(cards[i]);
            var points = Burndown.pointsOnCard(card);
            if (points === 0) {
                totals["unpointed"] += 1;
            }
            totals["points"] += points;
            
            // Put the card in a story (label colour) group
            var colour = Burndown.storyColourOnCard(card);
            if (colour in Burndown.stories) {
                Burndown.stories[colour]["cards"] += 1;
                Burndown.stories[colour]["points"] += points;
                if (points === 0) {
                    Burndown.stories[colour]["unpointed"] += 1;
                }
            } else {
                Burndown.stories[colour] = {
                    "cards": 1,
                    "points": points,
                    "unpointed": (points===0) ? 1 : 0
                }
            }
        }
    }
    console.log(Burndown.stories);
    return totals;
}

Burndown.populate = function() {
    // Get all the columns
    var columns = $("#board .list");
    var open_total = {
        "cards": 0,
        "points": 0,
        "unpointed": 0
    }
    var closed_total = {
        "cards": 0,
        "points": 0,
        "unpointed": 0
    }
    // Calculate some points and ting.
    for (var i=0; i<columns.length; i++) {
        var column = $(columns[i]);
        var headernode = $(".list-header h2", column);
        if (headernode.length != 0) {
            var colheader = $(".list-header h2", column)[0].childNodes[0].textContent;
            if (Burndown.oc.indexOf(colheader) !== -1) {
                var totals = Burndown.countCardsAndPointsInColumn(column);
                Burndown.openCards += totals['cards'];
                Burndown.openUnpointed += totals['unpointed'];
                Burndown.openPoints += totals['points'];
            } else if (Burndown.cc.indexOf(colheader) !== -1) {
                var totals = Burndown.countCardsAndPointsInColumn(column);
                Burndown.closedCards += totals['cards'];
                Burndown.closedPoints += totals['points'];
                Burndown.closedUnpointed += totals['unpointed'];
            }
        }
    }
    
    Burndown.totalPoints = Burndown.openPoints + Burndown.closedPoints;
    Burndown.totalCards = Burndown.openCards + Burndown.closedCards;
    Burndown.totalUnpointed = Burndown.openUnpointed + Burndown.closedUnpointed;
    /*
    console.log("Totals Open");
    console.log(Burndown.openCards);
    console.log(Burndown.openPoints);
    console.log(Burndown.openUnpointed);
    console.log("Totals Closed");
    console.log(Burndown.closedCards);
    console.log(Burndown.closedPoints);
    console.log(Burndown.closedUnpointed);
    console.log("Totals");
    console.log(Burndown.totalCards);
    console.log(Burndown.totalPoints);
    console.log(Burndown.totalUnpointed);
    */
    
    // TODO: Load the activity that happened yesterday.... LATER
    //$.getJSON("https://trello.com/1/boards/51f8e608381199b311000f4f/actions", function(data){
        //console.log(data);
    //});
    
    // Make a little block for my Burndown on the menu
    Burndown.initialiseTopline();
    
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