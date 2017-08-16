/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnChanges,
  Renderer2
} from '@angular/core';
import {ɵgetDOM as getDom} from '@angular/platform-browser';

import {BaseFxDirective} from '../core/base';
import {MediaMonitor} from '../../media-query/media-monitor';
import {MediaChange} from '../../media-query/media-change';

/**
 * This directive provides a responsive API for the HTML <img> 'src' attribute
 * and will update the img.src property upon each responsive activation.
 * Note: This solution is complementary to using the `img.srcset` approaches. Both are
 * published to support developer preference.
 *
 * e.g.
 *      <img src="defaultScene.jpg" src.xs="mobileScene.jpg"></img>
 *
 * @see https://css-tricks.com/responsive-images-youre-just-changing-resolutions-use-src/
 */
@Directive({
  selector: `
  [src.xs], [src.sm], [src.md], [src.lg], [src.xl],
  [src.lt-sm], [src.lt-md], [src.lt-lg], [src.lt-xl],
  [src.gt-xs], [src.gt-sm], [src.gt-md], [src.gt-lg]
`
})
export class ImgSrcDirective extends BaseFxDirective implements OnInit, OnChanges {

  /* tslint:disable */

  @Input('src.xs')     set srcXs(val)   { this._cacheInput('srcXs', val);  }
  @Input('src.sm')     set srcSm(val)   { this._cacheInput('srcSm', val);  }
  @Input('src.md')     set srcMd(val)   { this._cacheInput('srcMd', val);  }
  @Input('src.lg')     set srcLg(val)   { this._cacheInput('srcLg', val);  }
  @Input('src.xl')     set srcXl(val)   { this._cacheInput('srcXl', val);  }

  @Input('src.lt-sm')  set srcLtSm(val) { this._cacheInput('srcLtSm', val);  }
  @Input('src.lt-md')  set srcLtMd(val) { this._cacheInput('srcLtMd', val);  }
  @Input('src.lt-lg')  set srcLtLg(val) { this._cacheInput('srcLtLg', val);  }
  @Input('src.lt-xl')  set srcLtXl(val) { this._cacheInput('srcLtXl', val);  }

  @Input('src.gt-xs')  set srcGtXs(val) { this._cacheInput('srcGtXs', val);  }
  @Input('src.gt-sm')  set srcGtSm(val) { this._cacheInput('srcGtSm', val);  }
  @Input('src.gt-md')  set srcGtMd(val) { this._cacheInput('srcGtMd', val);  }
  @Input('src.gt-lg')  set srcGtLg(val) { this._cacheInput('srcGtLg', val);  }
  /* tslint:enable */

  constructor(elRef: ElementRef, renderer: Renderer2, monitor: MediaMonitor) {
    super(monitor, elRef, renderer);
  }

  /**
   * Listen for responsive changes to update the img.src attribute
   */
  ngOnInit() {
    super.ngOnInit();

    // Cache initial value of 'src', this will be used as fallback
    // NOTE: we do not bind to this 'src' property for input changes!
    this._cacheInput('src', this.defaultSrc);

    // Listen for responsive changes
    this._listenForMediaQueryChanges('src', this.defaultSrc, (changes: MediaChange) => {
      let activatedKey = 'src' + (changes.matches ? changes.suffix : '');
      this._updateSrcFor(activatedKey);
    });
    this._updateSrcFor();
  }

  /**
   * Update the 'src' property of the host <img> element
   */
  ngOnChanges() {
    if ( !this.hasInitialized ) {
      this._updateSrcFor();
    }
  }

  /**
   * Use the [responsively] activated input value to update
   * the host img src attribute.
   */
  protected _updateSrcFor(activatedKey?: string) {
    let url = !!activatedKey ? this._queryInput(activatedKey) :
        this._mqActivation ? this._mqActivation.activatedInput : null;

    this._renderer.setAttribute(this.nativeElement, 'src', url);
  }

  /**
   * The default 'src' property is not bound using @Input(), so perform
   * a post-ngOnInit() lookup of the default src value (if any).
   */
  protected get defaultSrc(): string {
    return getDom().getAttribute(this.nativeElement, 'src') || null;
  }
}
