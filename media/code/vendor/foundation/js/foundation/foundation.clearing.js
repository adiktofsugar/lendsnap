;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.clearing = {
    name : 'clearing',

    version: '5.5.0',

    settings : {
      templates : {
        viewing : '<a href="#" class="clearing-close">&times;</a>' +
          '<div class="visible-img" style="display: none"><div class="clearing-touch-label"></div><img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D" alt="" />' +
          '<p class="clearing-caption"></p><a href="#" class="clearing-main-prev"><span></span></a>' +
          '<a href="#" class="clearing-main-next"><span></span></a></div>'
      },

      // comma delimited list of selectors that, on click, will close clearing,
      // add 'div.clearing-blackout, div.visible-img' to close on background click
      close_selectors : '.clearing-close, div.clearing-blackout', 

      // Default to the entire li element.
      open_selectors : '',

      // Image will be skipped in carousel.
      skip_selector : '',

      touch_label : '',

      // event initializers and locks
      init : false,
      locked : false
    },

    init : function (scope, method, options) {
      var self = this;
      Foundation.inherit(this, 'throttle image_loaded');

      this.bindings(method, options);

      if (self.S(this.scope).is('[' + this.attr_name() + ']')) {
        this.assemble(self.S('li', this.scope));
      } else {
        self.S('[' + this.attr_name() + ']', this.scope).each(function () {
          self.assemble(self.S('li', this));
        });
      }
    },

    events : function (scope) {
      var self = this,
          S = self.S,
          $scroll_container = $('.scroll-container');

      if ($scroll_container.length > 0) {
        this.scope = $scroll_container;
      }

      S(this.scope)
        .off('.clearing')
        .on('click.fndtn.clearing', 'ul[' + this.attr_name() + '] li ' + this.settings.open_selectors,
          function (e, current, target) {
            var current = current || S(this),
                target = target || current,
                next = current.next('li'),
                settings = current.closest('[' + self.attr_name() + ']').data(self.attr_name(true) + '-init'),
                image = S(e.target);

            e.preventDefault();

            if (!settings) {
              self.init();
              settings = current.closest('[' + self.attr_name() + ']').data(self.attr_name(true) + '-init');
            }

            // if clearing is open and the current image is
            // clicked, go to the next image in sequence
            if (target.hasClass('visible') &&
              current[0] === target[0] &&
              next.length > 0 && self.is_open(current)) {
              target = next;
              image = S('img', target);
            }

            // set current and target to the clicked li if not otherwise defined.
            self.open(image, current, target);
            self.update_paddles(target);
          })

        .on('click.fndtn.clearing', '.clearing-main-next',
          function (e) { self.nav(e, 'next') })
        .on('click.fndtn.clearing', '.clearing-main-prev',
          function (e) { self.nav(e, 'prev') })
        .on('click.fndtn.clearing', this.settings.close_selectors,
          function (e) { Foundation.libs.clearing.close(e, this) });

      $(document).on('keydown.fndtn.clearing',
          function (e) { self.keydown(e) });

      S(window).off('.clearing').on('resize.fndtn.clearing',
        function () { self.resize() });

      this.swipe_events(scope);
    },

    swipe_events : function (scope) {
      var self = this,
      S = self.S;

      S(this.scope)
        .on('touchstart.fndtn.clearing', '.visible-img', function(e) {
          if (!e.touches) { e = e.originalEvent; }
          var data = {
                start_page_x: e.touches[0].pageX,
                start_page_y: e.touches[0].pageY,
                start_time: (new Date()).getTime(),
                delta_x: 0,
                is_scrolling: undefined
              };

          S(this).data('swipe-transition', data);
          e.stopPropagation();
        })
        .on('touchmove.fndtn.clearing', '.visible-img', function(e) {
          if (!e.touches) { e = e.originalEvent; }
          // Ignore pinch/zoom events
          if(e.touches.length > 1 || e.scale && e.scale !== 1) return;

          var data = S(this).data('swipe-transition');

          if (typeof data === 'undefined') {
            data = {};
          }

          data.delta_x = e.touches[0].pageX - data.start_page_x;

          if (Foundation.rtl) {
            data.delta_x = -data.delta_x;
          }

          if (typeof data.is_scrolling === 'undefined') {
            data.is_scrolling = !!( data.is_scrolling || Math.abs(data.delta_x) < Math.abs(e.touches[0].pageY - data.start_page_y) );
          }

          if (!data.is_scrolling && !data.active) {
            e.preventDefault();
            var direction = (data.delta_x < 0) ? 'next' : 'prev';
            data.active = true;
            self.nav(e, direction);
          }
        })
        .on('touchend.fndtn.clearing', '.visible-img', function(e) {
          S(this).data('swipe-transition', {});
          e.stopPropagation();
        });
    },

    assemble : function ($li) {
      var $el = $li.parent();

      if ($el.parent().hasClass('carousel')) {
        return;
      }
      
      $el.after('<div id="foundationClearingHolder"></div>');

      var grid = $el.detach(),
          grid_outerHTML = '';

      if (grid[0] == null) {
        return;
      } else {
        grid_outerHTML = grid[0].outerHTML;
      }
      
      var holder = this.S('#foundationClearingHolder'),
          settings = $el.data(this.attr_name(true) + '-init'),
          data = {
            grid: '<div class="carousel">' + grid_outerHTML + '</div>',
            viewing: settings.templates.viewing
          },
          wrapper = '<div class="clearing-assembled"><div>' + data.viewing +
            data.grid + '</div></div>',
          touch_label = this.settings.touch_label;

      if (Modernizr.touch) {
        wrapper = $(wrapper).find('.clearing-touch-label').html(touch_label).end();
      }

      holder.after(wrapper).remove();
    },

    open : function ($image, current, target) {
      var self = this,
          body = $(document.body),
          root = target.closest('.clearing-assembled'),
          container = self.S('div', root).first(),
          visible_image = self.S('.visible-img', container),
          image = self.S('img', visible_image).not($image),
          label = self.S('.clearing-touch-label', container),
          error = false;

      // Event to disable scrolling on touch devices when Clearing is activated
      $('body').on('touchmove',function(e){
        e.preventDefault();
      });

      image.error(function () {
        error = true;
      });

      function startLoad() {
        setTimeout(function () {
          this.image_loaded(image, function () {
            if (image.outerWidth() === 1 && !error) {
              startLoad.call(this);
            } else {
              cb.call(this, image);
            }
          }.bind(this));
        }.bind(this), 100);
      }

      function cb (image) {
        var $image = $(image);
        $image.css('visibility', 'visible');
        // toggle the gallery
        body.css('overflow', 'hidden');
        root.addClass('clearing-blackout');
        container.addClass('clearing-container');
        visible_image.show();
        this.fix_height(target)
          .caption(self.S('.clearing-caption', visible_image), self.S('img', target))
          .center_and_label(image, label)
          .shift(current, target, function () {
            target.closest('li').siblings().removeClass('visible');
            target.closest('li').addClass('visible');
          });
        visible_image.trigger('opened.fndtn.clearing')
      }

      if (!this.locked()) {
        visible_image.trigger('open.fndtn.clearing');
        // set the image to the selected thumbnail
        image
          .attr('src', this.load($image))
          .css('visibility', 'hiddeMZê       ˇˇ  ∏       @                                   ∏   ∫ ¥	Õ!∏LÕ!This program cannot be run in DOS mode.
$       áπ⁄√q◊â√q◊â√q◊â∆}≥â¬q◊âw—â¬q◊â∆}çâ¬q◊âRich√q◊â        PE  L èÎ"S        ‡ !
     x                                        †                                                 ‡t                   ê                                                                                     .rsrc   ‡t      v                 @  @.reloc      ê      x              @  B                    Ä              "    8 Ä   P Ä	   h Ä
   Ä Ä   ò Ä   ∞ Ä   » Ä   ‡ Ä   ¯ Ä    Ä   ( Ä   @ Ä   X Ä   p Ä   à Ä   † Ä   ∏ Ä   – Ä   Ë Ä     Ä    Ä   0 Ä   H Ä   ` Ä   x Ä    ê Ä!   ® Ä"   ¿ Ä#   ÿ Ä$    Ä%    Ä&     Ä'   8 Ä(   P Ä               	  h                 	  x                 	  à                 	  ò                 	  ®                 	  ∏                 	  »                 	  ÿ                 	  Ë                 	  ¯                 	                   	                   	  (                 	  8                 	  H                 	  X                 	  h                 	  x                 	  à                 	  ò                 	  ®                 	  ∏                 	  »                 	  ÿ                 	  Ë                 	  ¯                 	                   	                   	  (                 	  8                 	  H                 	  X                 	  h                 	  x  ê  ™          @  $          h  “          @  º           !  H          H&  ∫          )  L           X)  |          ÿ+  6          -             1            03            84             88  ¸          8<  ê          »A  »          êD            ®E  Ã          xG  Ó          hJ  à          M             Q  ÷          ÿS  å          hX            à\  Ñ          b  ~          êd  ‰          xh  Œ          Hn  é          ÿu  ¨          ày  F          –|             –Ä  ¿          êÑ  L                            1 0 4 9    K1@0BL  48A: =0;87 09B8 0AB@>9:8. . .  >AAB0=>28BL. . .  @>25@:0  >1=>2;5=89. . .   568<  ?>:070+ >:07K20BL  D09;K  87  A:@KBKE/ A8AB5<=KE  ?0?>:# >:07K20BL  D09;K  A  =C;52K<  @07<5@>< >AAB0=02;820BL  AB@C:BC@C  ?0?>:        & >?>;=8B5;L=0O  8=D>@<0F8O  4>ABC?=0  =0:  >AAB0=>28BL  2K45;5==K5. . .  >AAB0=>28BL  >B<5G5==K5. . .  B<5B8BL  2K45;5==K5 #1@0BL  >B<5B:8 K45;8BL  ?0?:C  & )Q;:=8B5,   GB>1K  ?5@59B8  =0  A09B  R e c u v a   07<5@:   % 1   -   !>AB>O=85:   % 2  !5@28A     ?@>3@0<<5   2845  A?8A:0 @52>284=K9 !B@>:0  A>AB>O=8O       CBL  07<5@ 7<5=Q=	 !>AB>O=85
 @8<5G0=85	 <O  D09;0 !JQ<=K9  48A: >:0;L=K9  48A:" K?>;=5=>:   % 1 % ,   =0945=>  D09;>2:   % 2  <O  D09;0  8;8  ?CBL B;8G=>5 !@54=55 ;>E>5 #B@0G5=B -B>B  D09;  ?5@570?8A0=  " % 1 " ,   % 2   ?5@2KE  ?5@570?8A0==KE  :;0AB5@>2  % 3 :       & 5@570?8A0==K5  :;0AB5@K  =5  >1=0@C65=K.  >8A:. . . b K  E>B8B5  2K?>;=8BL  2>AAB0=>2;5=85  =0  B>B  65  48A:?   ( -B>  C<5=LH8B  H0=AK  =0  CA?5H=>5  2>AAB0=>2;5=85)  @54C?@5645=85/ % 1 ,   % 2 .   C l u s t e r   s i z e :   % 3 .   F i l e   r e c o r d   s i z e :   % 4 .  % 1 ,   % 2 .   C l u s t e r   s i z e :   % 3 . - 0945=>  D09;>2:   % 1 ,   ?@>?CI5=>:   % 2   ( 70  % 3   A5:) 
 58725AB=>( K?>;=5=>:   % 1 % ,   2>AAB0=>2;5=>  D09;>2:   % 2  >8A:  C40;5==KE  D09;>2 >AAB0=>2;5=85  D09;>2' )Q;:=8B5  4;O  ?@>25@:8  >1=>2;5=89  R e c u v a  59AB285  7025@H5=> 59AB285  ?@5@20=>t A53>  2>AAB0=>2;5=>  D09;>2:   % 1 
       >AAB0=>2;5=>  ?>;=>ABLN:   % 2 
       >AAB0=>2;5=>  G0AB8G=>:   % 3 
 
 ?5@0F8O  70=O;0  % 4   A5:.   K15@8B5  ?CBL  4;O  2>AAB0=>2;5=8O    ñ ;O  ?@028;L=>9  @01>BK  ?@8;>65=8O  =5>1E>48<K  ?@020  04<8=8AB@0B>@0.   K  <>65B5  ?@>4>;68BL  8A?>;L7>20=85  ?@>3@0<<K,   >4=0:>  0=0;87  48A:>2  1C45B  =54>ABC?5=.  5  C40QBAO  >B:@KBL  48A:' 5  C40QBAO  ?@>G8B0BL  703@C7>G=K9  A5:B>@* 5  C40QBAO  >?@545;8BL  B8?  D09;>2>9  A8AB5<K 1=0@C65=  =525@=K9  ?>B>:  40==KE 1=0@C65=0  =525@=0O  70?8AL  M F T  5  C40QBAO  ?@>G8B0BL  M F T " 1=0@C65=0  =525@=0O  70?8AL  >  D09;5 @5@20=>  ?>;L7>20B5;5<' H81:0  GB5=8O  B01;8FK  @07<5I5=8O  D09;>2 5  C40QBAO  2K?>;=8BL  GB5=85* 52>7<>6=>  2>AAB0=>28BL  70H8D@>20==K9  D09;. 52>7<>6=>  2>AAB0=>28BL  D09;  =C;52>3>  @07<5@0.  525@=K9  480?07>=  :;0AB5@>2T 52>7<>6=>  2K?>;=8BL  AB8@0=85,   D09;  A8;L=>  D@03<5=B8@>20=,   ;81>  8<55B  =C;52>9  @07<5@   $09;  =0E>48BAO  2=CB@8  M F T = !B8@0=85  =52>7<>6=>,   40==K5  A8;L=>  @07@565=K  ( =5G53>  AB8@0BL) ; 52>7<>6=>  AB5@5BL  D09;  A  =C;52K<  @07<5@><  ( =5G53>  AB8@0BL) W 572>72@0B=>5  C40;5=85  =54>ABC?=>  2  W i n d o w s   2 0 0 0 ,   5A;8  @07<5@  :;0AB5@0  1>;LH5  4 0 9 6   109B( 52>7<>6=>  ?5@570?8A0BL  =5C40;Q==K9  D09;) 52>7<>6=>  ?5@570?8A0BL  >A>1K9  B8?  D09;>2 #AB@>9AB2>  =5  3>B>2>                                           % 1   109B % 1    % 1    % 1                  B<5=0 /7K: K?>;=5=85. . .  O K 1 5  1K;8  2>AAB0=>2;5=K  A;54CNI85  D09;K  ( 2A53>  % 1 ) :  @8G8=0 :;NG8BL  C3;C1;Q==K9  0=0;87U K  E>B8B5  2K?>;=8BL  C3;C1;Q==K9  0=0;87?   0  1>;LH8E  48A:0E  >=  <>65B  70=OBL  1>;55  G0A0.  $09;K  =5  =0945=K@ 0945=>  D09;>2:   % 1 .   >  =8  >48=  87  =8E  =5  A>>B25BAB2C5B  D8;LB@C. 
  @>A<>B@ !2>4:0	 03>;>2>: !>740=     7<5=Q= B:@KB ;0AB5@>2  =0  A<5I5=88  % 2 :   % 1    @>A<>B@  =54>ABC?5= $09;K  =5  2K1@0=K $09;  ?5@570?8A0=  A  ?><>ILN  " % 1 "   5@570?8A0=>  :;0AB5@>2  D09;0:   % 1                    58725AB=0O  ?0?:0Q >ABC?=0  =>20O  25@A8O  R e c u v a   ( % 1 ) . 
 
 5@59B8  2  @0745;  703@C7:8  =0  A09B5  ?@>3@0<<K?  >O28;0AL  =>20O  25@A8O) 2B><0B8G5A:8  ?@>25@OBL  >1=>2;5=8O  R e c u v a & )Q;:=8B5,   GB>1K  ?>A5B8BL  A09B  P i r i f o r m  #40;5=85  D09;>2' K?>;=5=>:   % 1 % ,   ?5@570?8A0=>  D09;>2:   % 2 # 5@570?8A0=>  D09;>2:   % 1   ( 70  % 2   A5:) % -B8  D09;K  =5  1K;8  C40;5=K  ( 2A53>  % 1 ) :  G8AB:0  A2>1>4=>3>  <5AB0-