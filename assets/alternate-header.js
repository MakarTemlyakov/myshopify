Shopify.theme.sections.register('alternate-header', {
  // Shortcut function called when a section is loaded via 'sections.load()' or by the Theme Editor 'shopify:section:load' event.
  onLoad: function () {
    // Do something when a section instance is loaded
    document.addEventListener('cart:added', this.onChangeCartCounter.bind(this));
  },

  // Shortcut function called when a section unloaded by the Theme Editor 'shopify:section:unload' event.
  onUnload: function () {
    // Do something when a section instance is unloaded
    document.removeEventListener('cart:added', this.onChangeCartCounter.bind(this));
  },

  // Shortcut function called when a section is selected by the Theme Editor 'shopify:section:select' event.
  onSelect: function () {
    // Do something when a section instance is selected
  },

  // Shortcut function called when a section is deselected by the Theme Editor 'shopify:section:deselect' event.
  onDeselect: function () {
    // Do something when a section instance is deselected
  },

  // Shortcut function called when a section block is selected by the Theme Editor 'shopify:block:select' event.
  onBlockSelect: function (event) {
    // Do something when a section block is selected
  },

  // Shortcut function called when a section block is deselected by the Theme Editor 'shopify:block:deselect' event.
  onBlockDeselect: function (event) {
    // Do something when a section block is deselected
  },

  onChangeCartCounter: function (e) {
    const counter = document.getElementById('product-form');
    const parser = new DOMParser();
    const parsedDocument = parser.parseFromString(e.detail.header, 'text/html');
    const parsedCountValue = parsedDocument.querySelector('.counter').textContent;
    const updatedCountValue = (document.querySelector('.counter').textContent = parsedCountValue);
  },
});
