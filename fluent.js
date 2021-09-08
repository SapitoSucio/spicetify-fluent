(function fluent() {

  function waitForElement(els, func, timeout = 10000) {
    const queries = els.map(el => document.querySelector(el));
    if (queries.every(a => a)) {
      func();
    } else if (timeout > 0) {
      setTimeout(waitForElement, 300, els, func, timeout--);
    }
  }

  waitForElement([
    ".main-rootlist-rootlistItemLink"
  ], function () {
    function replacePlaylistIcons() {
      const playListItems = document.getElementsByClassName("main-rootlist-rootlistItemLink");

      for (const item of playListItems) {
        const link = item.pathname;
        let uri;
        if (link.search("playlist") !== -1) {
          uri = Spicetify.URI.playlistV2URI(link.split("/").pop());
        } else if (link.search("folder") !== -1) {
          item.style.content = "url(https://api.iconify.design/fluent/folder-24-regular.svg?color=%23bbb)"
          item.style.padding = "10px";
          continue;
        }

        Spicetify.CosmosAsync.get(
          `sp://core-playlist/v1/playlist/${uri.toString()}/metadata`, {
          policy: {
            picture: true
          }
        }
        ).then(res => {
          const meta = res.metadata;
          if (meta.picture === "") {
            item.style.content = "url(https://api.iconify.design/fluent/music-note-2-24-regular.svg?color=%23bbb)"
            item.style.padding = "10px";
          } else {
            item.style.backgroundImage = "url(" + meta.picture + ")";
            item.style.content = "";
          }
        });
      };
    };

    replacePlaylistIcons();
    const observer = new MutationObserver(replacePlaylistIcons);
    waitForElement([".main-rootlist-wrapper .os-content"], () => {
      const rootList = document.querySelector(".main-rootlist-wrapper .os-content");
      observer.observe(rootList, {
        childList: true,
        subtree: true
      });
    });
  });

  waitForElement([
    '.main-navBar-navBarLink',
    '[href="/collection"] > span'
  ], () => {
    const navBarItems = document.getElementsByClassName("main-navBar-navBarLink");
    for (const item of navBarItems) {
      let div = document.createElement("div");
      div.classList.add("navBar-navBarLink-accent");
      item.appendChild(div);
    }
    document.querySelector('[href="/collection"] > span').innerHTML = "Library";
  });

  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--spice-text');
  if (textColor == " #000000") {
    document.documentElement.style.setProperty('--filter-brightness', 0);
  }

  Spicetify.Player.addEventListener("onplaypause", playerState => {
    const playButton = document.querySelector(".main-playButton-button")
    if (!playButton) return;
    if (playerState.data.is_paused) {
      playButton.style.cssText = "-webkit-mask-image: url('https://api.iconify.design/fluent/play-24-filled.svg');";
    } else {
      playButton.style.cssText = "-webkit-mask-image: url('https://api.iconify.design/fluent/pause-24-filled.svg');";
    }
  });
})();
