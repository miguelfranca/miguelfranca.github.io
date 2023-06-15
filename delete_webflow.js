window.addEventListener('load', function() {
  setTimeout(function() {
    var elements = document.getElementsByClassName('w-webflow-badge');
    
    while (elements.length > 0) {
      var element = elements[0];
      element.parentNode.removeChild(element);
    }
  }, 1000);
});