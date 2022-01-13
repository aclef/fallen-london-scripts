// ==UserScript==
// @name         Fallen London - Display Storylet Prerequisites
// @namespace    http://curwen/fallen.london.display.storylet.prerequisites
// @description  For Fallen London - Displays storylet prerequisites as a plain text
// @version      2.0
// @include      https://*fallenlondon.com/*
// ==/UserScript==

/*
Loosely based on original script by arundor (2016)
(rewritten to work with the Fallen London redesigned page)
*/

// Display style settings
let reqFontSize = '80%';
let reqVerticalPadding = '10px';
let reqLockedColor = '#6a5e5e';

// Try to render our text descriptions each time page updates storylet nodes
document.addEventListener('DOMNodeInserted', renderPreReqs, false);


function renderPreReqs() {
    let storylets = document.evaluate(
        // search only for storylets having prerequisites
        "//div[contains(@class, 'quality-requirement')]//ancestor::div[contains(@class, 'media--branch')]",
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE  // to make sure we won't fail iteration while updating page DOM
    );
    for (let i = 0; i < storylets.snapshotLength; i++) {
        let storylet = storylets.snapshotItem(i);
        if (!storylet) continue;
        // do not re-add description if already present
        if (storylet.getElementsByClassName('plain_text_reqs').length) continue;
        let storyletBody = storylet.querySelector('div.branch__body>div');
        // should not happen generally, but just in case...
        if (!storyletBody) continue;

        // find all tooltip images with requirements
        let tooltips = storylet.querySelectorAll('.buttons .quality-requirement div[role=button]');
        let infoDiv = document.createElement('div');
        if (tooltips.length) {
            infoDiv.setAttribute('class', 'plain_text_reqs');
            infoDiv.style.cssText = `font-size: ${reqFontSize}; padding: ${reqVerticalPadding} 0;`;

            for (let b = 0; b < tooltips.length; b++) {
                let tooltip = tooltips[b];
                let preReqTextEl = document.createElement('p');
                let text = tooltip.getAttribute('aria-label');
                if (!text) continue;
                preReqTextEl.textContent = text;
                if (tooltip.parent.classList.contains('icon--locked')) {
                    preReqTextEl.style.cssText = `color: ${reqLockedColor};`;
                }
                infoDiv.appendChild(preReqTextEl);
            }
        }
        // append info div even if there are no prerequisites to avoid re-running processing for this node
        storyletBody.appendChild(infoDiv);
    }
}