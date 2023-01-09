/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable no-constant-condition */
/* eslint-disable no-unused-vars */

import {register} from '@shopify/theme-sections';
import {getUrlWithVariant, ProductForm} from '@shopify/theme-product-form';
import * as currency from '@shopify/theme-currency';

class Accordion extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.isAllowMultitiple = false;
    this.items = [];
  }

  static get observedAttributes() {
    return ['allowMultitiple'];
  }

  connectedCallback() {
    this.render();
    this.isAllowMultitiple = this.hasAttribute('allowMultitiple') || false;
    this.items = this.querySelectorAll('ui-accordion-item') || [];
    this.items.forEach((item) =>
      item.addEventListener('change-item', this.checkItems.bind(this)),
    );
  }

  checkItems(event) {
    const items = this.items;
    const target = event.target;
    if (this.isAllowMultitiple) return;
    if (items && items.length > 0) {
      items.forEach((item) => {
        if (target !== item) {
          this.changeItem(item);
        }
      });
    }
  }

  changeItem(item) {
    item.isOpen = false;
    item.button.setAttribute('aria-expanded', item.isOpen);
    item.content.setAttribute('hidden', '');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if ((name = 'allowMultitiple')) {
      this.render();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
        ${this.styles()}
        ${this.template()}
    `;
  }

  styles() {
    return `
        <style>
          .groupAccordion {
            width: 41.5rem;
            border-top: 0.062rem solid var(--border-color-1);
          }
        </style>
      `;
  }

  template() {
    return `
        <div id="accordion" class="groupAccordion">
            <slot></slot>
        </div>
      `;
  }
}

class AccordionItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.isOpen = false;
    this._btnIdCounter = 0;
    this._contentIdCounter = 0;
  }

  render() {
    this.shadowRoot.innerHTML = `
        ${this.style()}
        ${this.template()}
    `;
  }

  connectedCallback() {
    this.headingLevel = document.createElement(
      `h${this.getAttribute('level-heading') || 5}`,
    ).tagName;
    this.render();
    this.button = this.shadowRoot.querySelector('button[aria-expanded]');
    this.isOpen = this.button.getAttribute('aria-expanded') === 'true';
    this.button.addEventListener('click', this.onClick.bind(this));
    this.controlsId = this.button.getAttribute('aria-controls');
    this.content = this.shadowRoot.getElementById(this.controlsId);
  }

  disconnectedCallback() {
    this.button.removeEventListener('click', this.onClick.bind(this));
  }

  static get observedAttributes() {
    return ['level-heading'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'level-heading':
        this.render();
        break;
      default:
    }
  }

  onClick() {
    this.toggle(!this.isOpen);
  }

  open() {
    this.toggle(true);
  }

  close() {
    this.toggle(false);
  }

  toggle(isOpen) {
    this.isOpen = isOpen;

    if (this.isOpen) {
      this.content.removeAttribute('hidden');
    } else {
      this.content.setAttribute('hidden', '');
    }
    this.button.setAttribute('aria-expanded', this.isOpen);
    const event = new CustomEvent('change-item', {
      bubbles: true,
      composed: true,
    });

    this.dispatchEvent(event);
  }

  style() {
    return `
        <style>
          ::slotted(p) {
            margin: 0;
          }
          .accordion__heading {
            margin:0;
          }
          .accordion__toggle {
            display: flex;
            position: relative;
            font-family: inherit;
            font-size: 1rem;
            border: none;
            background: transparent;
            border-bottom: 0.062rem solid var(--border-color-1);
            padding: 2rem 0;
            width: 100%;
          }
        
          .accordion__toggle[aria-expanded='true'] {
            border-bottom: none;
          }
        
          .accordion__toggle[aria-expanded='true'] .icon-plus::after {
            opacity:0;
            transform: rotate(0deg);
          }
                
          .accordion__panel {
            transition:all 0.3s ease-out;
            padding-bottom: 2.5rem;
            padding-right: 1.5rem;
            border-bottom: 0.062rem solid var(--border-color-1);
          }
  
          .icon-plus,
          .icon-plus::after {
            display: block;
            width: 0.75rem;
            height: 0.0625rem;
            position: absolute;
            right: 0;
            top: 50%;
            transition:0.3s all ease-out;
            margin-top: -0.0312rem;
            background: var(--background-color-2);
          }
  
          .icon-plus::after {
            content: '';
            transform: rotate(90deg);
          }
        </style>
      `;
  }

  template() {
    const buttonId = `itemId-${this._btnIdCounter++}`;
    const contentId = `controlId-${this._contentIdCounter++}`;
    return `
          <${this.headingLevel} class="accordion__heading">
            <button 
              type="button" 
              aria-expanded="${this.isOpen}" 
              class="accordion__toggle" aria-controls="${contentId}"
              id="${buttonId}">
                <slot name="label"></slot>
                <span class="icon-plus"></span>
            </button>
          </${this.headingLevel}>
          <div id="${contentId}" role="region" aria-labelledby="${buttonId}" class="accordion__panel" hidden>
              <slot name="content"></slot>
          </div>
      `;
  }
}

window.customElements.define('ui-accordion', Accordion);
window.customElements.define('ui-accordion-item', AccordionItem);

register('alternate-main-product', {
  customElement: null,
  productForm: null,
  formElement: null,

  // Shortcut function called when a section is loaded via 'sections.load()' or by the Theme Editor 'shopify:section:load' event.
  onLoad() {
    // Do something when a section instance is loaded

    this.formElement = this.container.querySelector('#product-form');
    const productHandle = this.container.dataset.handle;

    this.customElement =
      this.container.getElementsByTagName('ui-accrodion-item')[0];

    fetch(`/products/${productHandle}.js`)
      .then((response) => response.json())
      .then((productJSON) => {
        this.productForm = new ProductForm(this.formElement, productJSON, {
          onOptionChange: this.onOptionChange,
          onFormSubmit: this.onFormSubmit,
          onQuantityChange: this.onQuantityChange,
        });
      })

      .catch((error) => new Error({message: 'sad'}));
  },

  // Shortcut function called when a section unloaded by the Theme Editor 'shopify:section:unload' event.
  onUnload() {
    // Do something when a section instance is unloaded
    if (!this.productForm) return;
    this.productForm.destroy();
  },

  // Shortcut function called when a section is selected by the Theme Editor 'shopify:section:select' event.
  onSelect() {
    // Do something when a section instance is selected
    if (!this.customElement) return;
    this.customElement.open();
  },

  // Shortcut function called when a section is deselected by the Theme Editor 'shopify:section:deselect' event.
  onDeselect() {
    // Do something when a section instance is deselected
    this.customElement.close();
  },

  // Shortcut function called when a section block is selected by the Theme Editor 'shopify:block:select' event.
  onBlockSelect(event) {
    // Do something when a section block is selected
  },

  // Shortcut function called when a section block is deselected by the Theme Editor 'shopify:block:deselect' event.
  onBlockDeselect(event) {
    // Do something when a section block is deselected
  },

  onOptionChange(event) {
    const variant = event.dataset.variant;
    const btn = document.querySelector('#ATC-btn');
    const price = document.querySelector('.product__price');
    const formatedPrice = currency.formatMoney(
      variant.price,
      window.formatCurrency,
    );
    const colorOption = document.querySelector('.color-name');

    colorOption.textContent = `-${variant.option2}`;
    const url = getUrlWithVariant(window.location.href, variant.id);

    if (!variant) {
      btn.setAttribute('disabled', '');
      btn.value = btn.dataset.unavailable;
    } else if (variant && !variant.available) {
      btn.setAttribute('disabled', '');
      btn.value = btn.dataset.outOfStock;
    } else if (variant && variant.available) {
      btn.removeAttribute('disabled');
      btn.value = btn.dataset.atc;
    }

    price.textContent = formatedPrice;
    window.history.replaceState({path: url}, '', url);
  },
  async onFormSubmit(event) {
    event.preventDefault();
    let errorDescription;
    const form = document.getElementById('product-form');
    const customEvent = new CustomEvent('cart:added', {
      bubbles: true,
      detail: {
        header: null,
        error: null,
      },
    });
    try {
      const response = await fetch(`${event.target.action}.js`, {
        method: event.target.method,
        body: new FormData(event.target),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      const data = await response.json();
      errorDescription = data.description;
      customEvent.detail.header = data.sections['alternate-header'];
    } catch (error) {
      customEvent.detail.error = errorDescription;
    } finally {
      form.dispatchEvent(customEvent);
    }
  },

  onQuantityChange(event) {
    console.log('event:', event.dataset.quantity);
  },
});
