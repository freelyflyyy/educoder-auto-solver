import { DOCK_EDGE, STORAGE_KEYS } from '../core/constants.js';

function fitAxis(position, viewportSize, size) {
  return Math.min(Math.max(DOCK_EDGE, position), Math.max(DOCK_EDGE, viewportSize - size - DOCK_EDGE));
}

/**
 * Floating dock controller managing viewport-bounded positioning, pointer dragging, and edge snapping.
 */
export function createDock() {
  return {
    root: null,
    pill: null,
    panel: null,
    position: null,
    dragging: false,
    observer: null,
    onResize: null,
    mount(ui, onOpen) {
      this.root = ui.querySelector('.dock');
      this.pill = ui.getElementById('pill');
      this.panel = ui.getElementById('panel');
      this.position = this.readPosition();
      this.bindDrag(this.pill, this.root);
      this.bindDrag(ui.getElementById('handle'), this.panel);
      this.pill.addEventListener('click', onOpen);
      ui.getElementById('hide').addEventListener('click', () => this.close());
      this.panel.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        event.stopPropagation();
        this.close();
      });
      this.onResize = () => this.align();
      window.addEventListener('resize', this.onResize);
      if (typeof ResizeObserver === 'function') {
        this.observer = new ResizeObserver(() => this.align());
        this.observer.observe(this.pill);
        this.observer.observe(this.panel);
      }
      this.align();
    },
    destroy() {
      if (this.onResize) {
        window.removeEventListener('resize', this.onResize);
        this.onResize = null;
      }
      this.observer?.disconnect();
      this.observer = null;
    },
    readPosition() {
      try {
        const position = JSON.parse(localStorage.getItem(STORAGE_KEYS.dock) || 'null');
        if (Number.isFinite(position?.x) && Number.isFinite(position?.y)) return position;
      } catch { /* Fall back to default bottom-right position */ }
      return null;
    },
    place(element, x, y) {
      const left = fitAxis(x, window.innerWidth, element.offsetWidth);
      const top = fitAxis(y, window.innerHeight, element.offsetHeight);
      element.style.left = `${Math.round(left)}px`;
      element.style.top = `${Math.round(top)}px`;
      element.style.right = 'auto';
      element.style.bottom = 'auto';
    },
    isOnLeft(rect) {
      return rect.left + rect.width / 2 < window.innerWidth / 2;
    },
    align() {
      if (this.dragging || !this.root) return;
      if (this.position) this.place(this.root, this.position.x, this.position.y);
      if (this.panel.hidden) return;
      const anchor = this.pill.getBoundingClientRect();
      const left = this.isOnLeft(anchor) ? anchor.left : anchor.right - this.panel.offsetWidth;
      this.place(this.panel, left, anchor.top);
    },
    open() {
      this.pill.setAttribute('aria-expanded', 'true');
      this.panel.hidden = false;
      this.align();
      this.panel.focus({ preventScroll: true });
    },
    close() {
      this.panel.hidden = true;
      this.pill.setAttribute('aria-expanded', 'false');
      this.align();
      this.pill.focus({ preventScroll: true });
    },
    snap(element) {
      const rect = element.getBoundingClientRect();
      const x = this.isOnLeft(rect) ? DOCK_EDGE : window.innerWidth - this.pill.offsetWidth - DOCK_EDGE;
      this.position = { x: Math.max(DOCK_EDGE, x), y: rect.top };
      this.align();
      try {
        localStorage.setItem(STORAGE_KEYS.dock, JSON.stringify(this.position));
      } catch { /* Keep in-memory coordinates */ }
    },
    bindDrag(handle, element) {
      let drag;
      let suppressClick = false;
      const fromPill = handle === this.pill;

      const move = event => {
        if (event.pointerId !== drag?.id) return;
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        if (!drag.moved && Math.max(Math.abs(dx), Math.abs(dy)) < 4) return;
        drag.moved = true;
        this.dragging = true;
        element.classList.add('is-dragging');
        this.place(element, drag.left + dx, drag.top + dy);
      };

      const finish = event => {
        if (event.pointerId !== drag?.id) return;
        document.removeEventListener('pointermove', move, true);
        document.removeEventListener('pointerup', finish, true);
        document.removeEventListener('pointercancel', finish, true);
        const moved = drag.moved;
        drag = null;
        if (!moved) return;
        element.classList.remove('is-dragging');
        this.dragging = false;
        suppressClick = fromPill;
        this.snap(element);
      };

      handle.addEventListener('pointerdown', event => {
        if (drag || this.dragging || !event.isPrimary || event.button !== 0) return;
        if (!fromPill && event.target.closest('button')) return;
        const rect = element.getBoundingClientRect();
        suppressClick = false;
        drag = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          left: rect.left,
          top: rect.top,
          moved: false,
        };
        document.addEventListener('pointermove', move, true);
        document.addEventListener('pointerup', finish, true);
        document.addEventListener('pointercancel', finish, true);
      });

      if (fromPill) {
        handle.addEventListener('click', event => {
          if (suppressClick && event.detail > 0) event.stopImmediatePropagation();
          suppressClick = false;
        }, true);
      }
    },
  };
}
