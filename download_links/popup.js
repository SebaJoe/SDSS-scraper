// Part of this code is adapted from the Chromium Authors example for 
// chrome.downloads.download() function.
// The JSZip code is heavily borrowed from an example in their website
// and the code for the progress bar in html is direct copy from their example

var allLinks = [];
var visibleLinks = [];

// Display all visible links.
function showLinks() {
  var linksTable = document.getElementById('links');
  while (linksTable.children.length > 1) {
    linksTable.removeChild(linksTable.children[linksTable.children.length - 1])
  }
  for (var i = 0; i < visibleLinks.length; ++i) {
    var row = document.createElement('tr');
    var col0 = document.createElement('td');
    var col1 = document.createElement('td');
    var checkbox = document.createElement('input');
    checkbox.checked = true;
    checkbox.type = 'checkbox';
    checkbox.id = 'check' + i;
    col0.appendChild(checkbox);
    col1.innerText = visibleLinks[i];
    col1.style.whiteSpace = 'nowrap';
    col1.onclick = function() {
      checkbox.checked = !checkbox.checked;
    }
    row.appendChild(col0);
    row.appendChild(col1);
    linksTable.appendChild(row);
  }
}

// Toggle the checked state of all visible links.
function toggleAll() {
  var checked = document.getElementById('toggle_all').checked;
  for (var i = 0; i < visibleLinks.length; ++i) {
    document.getElementById('check' + i).checked = checked;
  }
}

var Promise = window.Promise;

if(!Promise){
    Promise = JSZip.external.Promise;
}

function urlToPromise(url){
    return new Promise(function(resolve, reject){
        //JSZipUtils is used to get the image data from the image link
        JSZipUtils.getBinaryContent(url, function (err, data) {
            if(err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

/**
 *  * Reset the message.
 *   */
function resetMessage () {
        $("#result")
        .removeClass()
        .text("");
}
/**
 *  * show a successful message.
 *   * @param {String} text the text to show.
 *    */
function showMessage(text) {
        resetMessage();
        $("#result")
        .addClass("alert alert-success")
        .text(text);
}
/**
 *  * show an error message.
 *   * @param {String} text the text to show.
 *    */
function showError(text) {
        resetMessage();
        $("#result")
        .addClass("alert alert-danger")
        .text(text);
}
/**
 *  * Update the progress bar.
 *   * @param {Integer} percent the current percent
 *    */
function updatePercent(percent) {
        $("#progress_bar").removeClass("hide")
       .find(".progress-bar")
       .attr("aria-valuenow", percent)
       .css({
           width : percent + "%"
       });
}

// Download all visible checked links.
function downloadCheckedLinks() {
  resetMessage();

  var zip = new JSZip();
  for (var i = 0; i < visibleLinks.length; ++i) {
    if (document.getElementById('check' + i).checked) {
        var filename = i + ".jpg";
        zip.file(filename, urlToPromise(visibleLinks[i]), {binary:true});
    }
  }
  zip.generateAsync({type:"base64"}, function updateCallback(metadata) {
    var msg = "progression: " + metadata.percent.toFixed(2) + " %";
    if(metadata.currentFile){
        msg += ", current file = " + metadata.currentFile;
    }
      showMessage(msg);
      updatePercent(metadata.percent|0);
  })
    .then(function (content) {
        location.href="data:application/zip;base64,"+content;
        showMessage("done!");
    }, function (e) {
        showError(e);
    });
  //window.close();
}

// Re-filter allLinks into visibleLinks and reshow visibleLinks.
function filterLinks() {
  var filterValue = document.getElementById('filter').value;
  if (document.getElementById('regex').checked) {
    visibleLinks = allLinks.filter(function(link) {
      return link.match(filterValue);
    });
  } else {
    var terms = filterValue.split(' ');
    visibleLinks = allLinks.filter(function(link) {
      for (var termI = 0; termI < terms.length; ++termI) {
        var term = terms[termI];
        if (term.length != 0) {
          var expected = (term[0] != '-');
          if (!expected) {
            term = term.substr(1);
            if (term.length == 0) {
              continue;
            }
          }
          var found = (-1 !== link.indexOf(term));
          if (found != expected) {
            return false;
          }
        }
      }
      return true;
    });
  }
  showLinks();
}

function toggleOptions(){
    $("#options").toggleClass("d-none");
}

// Add links to allLinks and visibleLinks, sort and show them.  send_links.js is
// injected into all frames of the active tab, so this listener may be called
// multiple times.
chrome.extension.onRequest.addListener(function(links) {
  for (var index in links) {
    allLinks.push(links[index]);
  }
  allLinks.sort();
  visibleLinks = allLinks;
  showLinks();
  filterLinks();
});

// Set up event handlers and inject send_links.js into all frames in the active
// tab.
window.onload = function() {
  document.getElementById('filter').onkeyup = filterLinks;
  document.getElementById('regex').onchange = filterLinks;
  document.getElementById('toggle_all').onchange = toggleAll;
  document.getElementById('download0').onclick = downloadCheckedLinks;
  document.getElementById('optionBtn').onclick = toggleOptions;

  chrome.windows.getCurrent(function (currentWindow) {
    chrome.tabs.query({active: true, windowId: currentWindow.id},
                      function(activeTabs) {
      chrome.tabs.executeScript(
        activeTabs[0].id, {file: 'send_links.js', allFrames: true});
    });
  });
};
