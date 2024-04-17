const generateDirectoryHTML = (style: string, directory: string, linkedPath: string, files: string) => {
  return `
<!DOCTYPE html>
<html>

<head>
  <meta charset='utf-8'>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Affichage du répertoire ${directory}</title>
  <style>
    ${style}
  </style>
  <script>
    function $(id) {
      var el = 'string' == typeof id
        ? document.getElementById(id)
        : id;

      el.on = function (event, fn) {
        if ('content loaded' == event) {
          event = window.attachEvent ? "load" : "DOMContentLoaded";
        }
        el.addEventListener
          ? el.addEventListener(event, fn, false)
          : el.attachEvent("on" + event, fn);
      };

      el.all = function (selector) {
        return $(el.querySelectorAll(selector));
      };

      el.each = function (fn) {
        for (var i = 0, len = el.length; i < len; ++i) {
          fn($(el[i]), i);
        }
      };

      el.getClasses = function () {
        return this.getAttribute('class').split(/\s+/);
      };

      el.addClass = function (name) {
        var classes = this.getAttribute('class');
        el.setAttribute('class', classes
          ? classes + ' ' + name
          : name);
      };

      el.removeClass = function (name) {
        var classes = this.getClasses().filter(function (curr) {
          return curr != name;
        });
        this.setAttribute('class', classes.join(' '));
      };

      return el;
    }

    function search() {
      var str = $('search').value.toLowerCase();
      var links = $('files').all('a');

      links.each(function (link) {
        var text = link.textContent.toLowerCase();

        if ('..' == text) return;
        if (str.length && ~text.indexOf(str)) {
          link.addClass('highlight');
        } else {
          link.removeClass('highlight');
        }
      });
    }

    $(window).on('content loaded', function () {
      $('search').on('keyup', search);
    });

  </script>
</head>

<body class="directory">
  <input id="search" type="text" placeholder="Rechercher" autocomplete="off" />
  <div id="wrapper">
    <h1><a href="/">~</a>${linkedPath}</h1>
    ${files}
  </div>
  <script>
    const getCookie = (name) => {
      var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      if (match) return match[2];
    }

    const userId = JSON.parse(getCookie("userData").replaceAll("%22", '"').replaceAll("%2C", ",")).id;
    const links = document.querySelectorAll("a");
    const activeListeners = [];
    links.forEach((link, index)=>{
      activeListeners.push(true);
      link.addEventListener('click', (e)=>{
        if (activeListeners[index]) {
          activeListeners[index] = false;

          var xhr = new XMLHttpRequest();
          xhr.open("POST", "http://*:3333/register-file-opening".replace("*", location.hostname), true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(JSON.stringify({
              userId, file: e.target.innerHTML
          }));
}
});
});
</script>
</body>

</html>
`
}

export default generateDirectoryHTML;
