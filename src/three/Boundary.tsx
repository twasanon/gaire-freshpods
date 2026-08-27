import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * Keeps a failed 3D layer from taking the page down with it.
 *
 * The canvas is an enhancement over the poster, so anything that throws inside
 * it — a dropped GLB request, a refused WebGL context, a lost device — should
 * retire the canvas and leave the static hero standing. Without this, one failed
 * model fetch unmounts the whole site.
 */
export class Boundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.warn('[stage] 3D layer retired:', error.message, info.componentStack);
    }
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
