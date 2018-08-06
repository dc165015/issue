import { ViewController } from 'ionic-angular';
import { Directive, Input, ElementRef, Renderer, OnInit, HostListener } from '@angular/core';

@Directive({
  selector: '[hide-header]', // Attribute selector
})
export class HideHeaderDirective implements OnInit{
  @Input("header") header: HTMLElement;
  @Input("containerContent") container: HTMLElement;
  headerHeight;
  self;
  scrollContent;

  constructor(public element: ElementRef, public renderer: Renderer, private viewCtrl: ViewController) {
  }

  ngOnInit(){
    this.self = this.element.nativeElement;
    this.headerHeight = this.header.clientHeight;
    this.renderer.setElementStyle(this.header, 'webkitTransition', 'top 700ms');

    // if container is fixed, then use getFixedElement to get _fixedContent; else use getScrollElement to get _scrollContent
    // this.scrollContent = (this.container as any).getFixedElement();
    this.scrollContent = (this.container as any).getScrollElement();
    this.renderer.setElementStyle(this.scrollContent, 'webkitTransition', 'margin-top 700ms');
  }

  @HostListener('scroll') onScroll() {
    if(this.self.scrollTop > 56){
      this.renderer.setElementStyle(this.header, "top", "-56px")
      this.renderer.setElementStyle(this.scrollContent, "margin-top", "0px")
    } else {
      this.renderer.setElementStyle(this.header, "top", "0px");
      this.renderer.setElementStyle(this.scrollContent, "margin-top", "56px")
    }
  }

}
