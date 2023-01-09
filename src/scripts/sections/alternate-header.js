/* eslint-disable no-unused-vars */

import {register} from '@shopify/theme-sections';
import {getUrlWithVariant, ProductForm} from '@shopify/theme-product-form';

register('alternate-header', {
  // Shortcut function called when a section is loaded via 'sections.load()' or by the Theme Editor 'shopify:section:load' event.

  form: null,
  onLoad() {
    this.form = document.getElementById('product-form');
    this.form.addEventListener('cart:added', this.onChangeCartCounter);
    this.onChangeCartCounter = this.onChangeCartCounter.bind(this);
  },

  // Shortcut function called when a section unloaded by the Theme Editor 'shopify:section:unload' event.
  onUnload() {
    // Do something when a section instance is unloaded
    // this.container.removeEventListener('cart:added', this.onChangeCartCounter);
  },

  // Shortcut function called when a section is selected by the Theme Editor 'shopify:section:select' event.
  onSelect() {
    // Do something when a section instance is selected
  },

  // Shortcut function called when a section is deselected by the Theme Editor 'shopify:section:deselect' event.
  onDeselect() {
    // Do something when a section instance is deselected
  },

  // Shortcut function called when a section block is selected by the Theme Editor 'shopify:block:select' event.
  onBlockSelect(event) {
    // Do something when a section block is selected
  },

  // Shortcut function called when a section block is deselected by the Theme Editor 'shopify:block:deselect' event.
  onBlockDeselect(event) {
    // Do something when a section block is deselected
  },

  onChangeCartCounter(event) {
    const counter = document.querySelector('.counter');
    const error = this.querySelector('.error');
    if (event.detail.error) {
      error.textContent = event.detail.error;
      return;
    }

    if (!event.detail.error) {
      error.textContent = '';
    }

    const parser = new DOMParser();
    const parsedDocument = parser.parseFromString(
      event.detail.header,
      'text/html',
    );
    const parsedCountValue = parsedDocument.querySelector('.counter');
    counter.textContent = parsedCountValue.innerHTML;
  },
});
