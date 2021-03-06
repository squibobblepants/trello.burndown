trello.burndown
===============

About
-----
The Trello Scrum Master Burndown Chrome extension adds a summary of the cards on a Trello Board at the end of the left hand top menu (white bar). It summarises total cards and points, open cards and points, and closed cards and points.


Dependencies
------------
This extension relies on there being a points number recorded at the end of the card title, in parentheses. This number is most often added by using the "Scrum for Trello" plugin available for free in the Chrome Web Store. 


Installation
------------

 - Open the extensions page in Chrome - chrome://extensions/
 - Drag [trello.burndown.crx](https://raw.github.com/squibobblepants/trello.burndown/master/trello.burndown.crx) onto the window.
 - Click the "options" link under the extension description
 - Fill in the form you see with a comma separated list of column names (case sensitive) that represent open and closed tickets, click save
 - Visit the Trello board you are using, and refresh it

Features
--------
Once you've installed the extension you will see a new item in the top menu, providing a summary of the open cards. Clicking this section will give you an extended overview of open, closed and total tickets:

![Extended ticket summary](https://raw.github.com/squibobblepants/trello.burndown/master/feature-screenshot.png)


Development
-----------

 - Clone this repository to a folder of your choice
 - Open the extensions page in Chrome - chrome://extensions/
 - Make sure to remove any versions of the plugin.
 - Check the "Developer mode" checkbox in the top right of the page.
 - Click "Load unpacked extension"
 - Navigate to the src directory in the folder you checked out the repository into and click OK


Building
--------

 - Update the version in manifest.json
 - Open the extensions page in Chrome - chrome://extensions/
 - Check the "Developer mode" checkbox in the top right of the page.
 - Click "Pack extension"
 - Select the repository's src directory and trello.burndown.pem and click OK
 - Rename src.crx to trello.burndown.crx
 - Update the version in updates.xml
 - Commit and push to git server
