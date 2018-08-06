import { Component, Input, ElementRef, Renderer, OnChanges, SimpleChange } from '@angular/core';
import { ImageViewerController } from 'ionic-img-viewer';
import { isPresent } from 'ionic-angular/util/util';

@Component({
    selector: 'preload-image',
    templateUrl: 'preload-image.html',
})
export class PreloadImage implements OnChanges {
    _src: string = '';
    _ratio: { w: number; h: number } = { w: 1, h: 1 };
    _img: any;
    _imageViewerCtrl: ImageViewerController;

    constructor(public _elementRef: ElementRef, public _renderer: Renderer, imageViewerCtrl: ImageViewerController) {
        this._img = new Image();
        this._imageViewerCtrl = imageViewerCtrl;
    }

    @Input() alt: string;

    @Input() title: string;

    @Input()
    set src(val: string) {
        this._src = isPresent(val) ? val : '';
    }

    @Input()
    set ratio(ratio: { w: number; h: number }) {
        this._ratio = ratio || null;
    }

    @Input() zoom: boolean = false;

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        let ratio_height = this._ratio.h / this._ratio.w * 100 + '%';
        // Conserve aspect ratio (see: http://stackoverflow.com/a/10441480/1116959)
        this._renderer.setElementStyle(this._elementRef.nativeElement, 'padding-bottom', ratio_height);

        this._update();
        // console.log("CHANGES preload-image", this._src);
        // console.log(changes['src'].isFirstChange());
    }

    _update() {
        if (isPresent(this.alt)) {
            this._img.alt = this.alt;
        }
        if (isPresent(this.title)) {
            this._img.title = this.title;
        }

        this._img.addEventListener('load', () => {
            this._elementRef.nativeElement.appendChild(this._img);
            this._loaded(true);
        });

        this._img.src = this._src;

        if (this.zoom) {
            this._img.onclick = () => this._imageViewerCtrl.create(this._img).present();
        }

        this._loaded(false);
    }

    _loaded(isLoaded: boolean) {
        this._elementRef.nativeElement.classList[isLoaded ? 'add' : 'remove']('img-loaded');
    }
}
