// ==UserScript==
// @author       Curwen Corey
// @name         Fallen London - Display Storylet Prerequisites
// @namespace    http://curwencorey.cc/
// @description  Displays Fallen London storylet prerequisites as a plain text
// @downloadURL  https://github.com/aclef/fallen-london-scripts/blob/master/display_prereq.user.js
// @updateURL    https://github.com/aclef/fallen-london-scripts/blob/master/display_prereq.user.js
// @supportURL   https://github.com/aclef/fallen-london-scripts/issues
// @version      2.4.0
// @match      https://*.fallenlondon.com/*
// @license MIT
// ==/UserScript==

/*
Loosely based on logic from the original scripts by kaanyia and arundor (2016 version)
This version was written from scratch to work with the Fallen London redesigned page.
*/

// Display style settings
let reqFontSize = '80%';
let reqVerticalPadding = '10px';
let maxLength = 250;
// color for locked branches
let reqLockedColor = '#6a5e5e';
// do not show already met requirements
let showOnlyLocked = false;

// Try to render our text descriptions each time page updates storylet nodes
document.addEventListener('DOMNodeInserted', renderPreReqs, false);

// also, re-render after changing active tab (required to support Plans rendering)
let navLinks = document.querySelectorAll('li.nav__item');
if (navLinks.length){
    for (let t = 0; t < navLinks.length; t++) {
        navLinks[t].addEventListener("click", renderPreReqs, false);
    }
}


function renderPreReqs() {
    let storylets = document.evaluate(
        // search only for storylets having prerequisites
        "//div[contains(@class, 'quality-requirement')]//" +
        "ancestor::div[(contains(@class, 'storylet') and @data-branch-id) or contains(@class, 'media--branch')" +
        "or contains(@class, 'branch plans_separator')]",
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE // to make sure we won't fail iteration while updating page DOM
    );
    for (let i = 0; i < storylets.snapshotLength; i++) {
        let storylet = storylets.snapshotItem(i);
        if (!storylet) continue;
        // do not re-add description if already present
        if (storylet.getElementsByClassName('plain_text_reqs').length) continue;
        let storyletBody = storylet.querySelector('div.storylet__body>div, div.branch__body>div, div.media__body>h4');
        // should not happen generally, but just in case...
        if (!storyletBody) continue;

        // find all tooltip images with requirements
        let tooltips = storylet.querySelectorAll('.buttons .quality-requirement div[role=button]');
        let infoDiv = document.createElement('div');
        infoDiv.setAttribute('class', 'plain_text_reqs');
        let infoDivFilled = false;
        if (tooltips.length) {
            for (let b = 0; b < tooltips.length; b++) {
                let tooltip = tooltips[b];
                let tooltipLocked = tooltip.parentNode.classList.contains('icon--locked');
                if (showOnlyLocked && !tooltipLocked) continue;
                let preReqTextEl = document.createElement('p');
                preReqTextEl.setAttribute('class', 'plain_text_requirement');
                let text = tooltip.getAttribute('aria-label');
                if (!text) continue;
                if (text.length > maxLength) text = text.slice(0, maxLength) + '...';
                preReqTextEl.textContent = text;
                if (tooltipLocked) {
                    preReqTextEl.style.cssText = `color: ${reqLockedColor};`;
                }
                infoDiv.appendChild(preReqTextEl);
                infoDivFilled = true;
            }
        }
        if (infoDivFilled) infoDiv.style.cssText = `font-size: ${reqFontSize}; padding: ${reqVerticalPadding} 0;`;

        // append info div even if there are no prerequisites to avoid re-running processing for this node
        if (storyletBody.tagName.toLowerCase() != 'h4') {
            storyletBody.appendChild(infoDiv);
        } else {
            storyletBody.parentNode.insertBefore(infoDiv, storyletBody.nextSibling);
        }
    }
}
