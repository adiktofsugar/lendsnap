&h�W�JZF���3��l��wa�z��������C����X,�3D��NT#���O�R�rf O�r��T���?pơ�o�[:���E�]�\ORTq�:@A���f� ����dxb��[�ߥ�������r���a)��¡F��'���y�Bu$�[n�au�9��'ff��<1�$���3�|��B.�6F�THD�S������U�J��W�ض�h	���mP��� �ܿ�)�&�s�|SI�,`hT��>�����ˤg���~����\�ؒ'�x����ހp��@;͌?ݗrU���[v���������\4�W��Y��4�ʘ��Z]x�J�x��~�B������o�0xG����ݟi3�q�a(�s6;��\�3�^~���/�訐]y����� .�[�bL�W�|
������ ��D� g����{t�s�����}�gA^\��M� ���[�_���Ӆ\W�,,y��(�?�+�l�({Q6ś<�x�EC�SN�E: p�<�ZgR��7-�!ۈo\y���z�jI٣��ț>�#I�+Ng��I
ѷ�+�Zʠ��Zj����16G��l��,�9@I�e-t4@C/��^	�Ȑ�/�S��0%oiQ���g|�h�;�!���m�]�F��v�g�[(��]ξ��PǏc��+;���z�a��?).: �3w��M8Nb����zi�
$���Ky��1������A3��H��~ON9�%:��0��>wKf��� �z`��/#dhe����y�Gr� 1����6 +��	]Ĉ���^���p�snr6e��uE�L�%�Y�����¼���X!�˲�.:��>��/�Y�u:D�#dԕ.�g��%Y2E�I{A1ƣ�xo)���E�p뎏4,`C��<Ը��������nH0��L۸��9��� o^�'��I�e���u0/����{#$�+I���
���Y��[0�ȟ��R��]?�*
:��u�^R,X*ё�:�{)�2V���d
�sɎ�ׁ��h �aGK\B�R�����WJ�.�#�ſˣ=f���u�c�w���x銑!�;��e�#؁K��>{9����sw�Kr���KL)"����
@�.>�Z�}��&3}n�^$Sg%x�w�rDJ���A��p��B!��)��A����{�C��dҨ�Q�;�fe���gAٲ�����?g)6^�a������Kϋ�6�� Y�cp"ᙳ4�|^��ȃ�>�,WF���ER�6�k��4�~m<A�-ˁ�a��(�Y�w�kZ���MZx㍽���X��R~���b
���|om��o~2�+���s�mT���`	�)�J�����K�E������5�t!���(a.�)K�p��7��%D����� p٣�M�a2�
�X|��m��`��kr�R���H��2_V����X[�A�2e�$1t8�Y�D��
T,�o�6���D,ԃ�s;���T�Q�k,��U{!�ȌcPO �3"��E�H�����C��6�J߅���M�O�v�q���f�1�l!¯hs}�P>+J?i�o�k�Dt�����W���[0s�J=C�,)dx�Ŕ���9��[+/H�æ��)��/F�l3�p�̿t0�Ĝ,��*=F�w:��]�y�ԋ��,��Ma,�ҁ���F�d�x�k`֪��UipG��q�壞�a������ ��9����ǷH���Z{8�"0M�;��c_�D�#�{_���t~�rt3/,�ݴ�������ؾ�Wʿ����b�j$��h�����$���x�	Zۂ��ZSc��A�?�� ��fY �\���X�-���k���īF�&���9�f�1����ܒo���h�O�p5�Ż��d�v`�4�����������qK���Z%�\��0m+s�%?�e�.��^K��/���<a� q�]N"�.�nH<&[-�y`z���a�1���x��rQҏ:�A��4f�!Kx{��0�[�!A�þ��"4J���K0�<<��y6�B�x��N!$���(�+X.��z2��WrGו�?M/o����x��%��X��|��T`�,CƬW��ֿ�T2_�:�S�{E�`�ڕ�-eD���[�`l\�V��ȷ;.�5����G�QX�2���SV˵��5����C���4�r����x��2w�F�2��.�3n��
3�p���2����LZ�j���>y9�,�靲�R[��|�Ӣ&Ef����a݁�i��ؖn�+����K�V[(���w���J����0{4�w����7h�9��V�0o                                                                                                                                                                                                       ngs.disable_for_touch && Modernizr.touch && /touchstart|MSPointerDown/i.test(e.type)) {
              e.preventDefault();
              S(settings.tooltip_class + '.open').hide();
              is_touch = true;
            }

            if (/enter|over/i.test(e.type)) {
              this.timer = setTimeout(function () {
                var tip = self.showTip($this);
              }.bind(this), self.settings.hover_delay);
            } else if (e.type === 'mouseout' || e.type === 'mouseleave') {
              clearTimeout(this.timer);
              self.hide($this);
            } else {
              self.showTip($this);
            }
          }
        })
        .on('mouseleave.fndtn.tooltip touchstart.fndtn.tooltip MSPointerDown.fndtn.tooltip', '[' + this.attr_name() + '].open', function (e) {
          if (/mouse/i.test(e.type) && self.ie_touch(e)) return false;

          if($(this).data('tooltip-open-event-type') == 'touch' && e.type == 'mouseleave') {
            return;
          }
          else if($(this).data('tooltip-open-event-type') == 'mouse' && /MSPointerDown|touchstart/i.test(e.type)) {
            self.convert_to_touch($(this));
          } else {
            self.hide($(this));
          }
        })
        .on('DOMNodeRemoved DOMAttrModified', '[' + this.attr_name() + ']:not(a)', function (e) {
          self.hide(S(this));
        });
    },

    ie_touch : function (e) {
      // How do I distinguish between IE11 and Windows Phone 8?????
      return false;
    },

    showTip : function ($target) {
      var $tip = this.getTip($target);
      if (this.should_show($target, $tip)){
        return this.show($target);
      }
      return;
    },

    getTip : function ($target) {
      var selector = this.selector($target),
          settings = $.extend({}, this.settings, this.data_options($target)),
          tip = null;

      if (selector) {
        tip = this.S('span[data-selector="' + selector + '"]' + settings.tooltip_class);
      }

      return (typeof tip === 'object') ? tip : false;
    },

    selector : function ($target) {
      var id = $target.attr('id'),
          dataSelector = $target.attr(this.attr_name()) || $target.attr('data-selector');

      if ((id && id.length < 1 || !id) && typeof dataSelector != 'string') {
        dataSelector = this.random_str(6);
        $target
          .attr('data-selector', dataSelector)
          .attr('aria-describedby', dataSelector);
      }

      return (id && id.length > 0) ? id : dataSelector;
    },

    create : function ($target) {
      var self = this,
          settings = $.extend({}, this.settings, this.data_options($target)),
          tip_template = this.settings.tip_template;

      if (typeof settings.tip_template === 'string' && window.hasOwnProperty(settings.tip_template)) {
        tip_template = window[settings.tip_template];
      }

      var $tip = $(tip_template(this.selector($target), $('<div></div>').html($target.attr('title')).html())),
          classes = this.inheritable_classes($target);

      $tip.addClass(classes).appendTo(settings.append_to);

      if (Modernizr.touch) {
        $tip.append('<span class="tap-to-close">'+settings.touch_close_text+'</span>');
        $tip.on('touchstart.fndtn.tooltip MSPointerDown.fndtn.tooltip', function(e) {
          self.hide($target);
        });
      }

      $target.removeAttr('title').attr('title','');
    },

    reposition : function (target, tip, classes) {
      var width, nub, nubHeight, nubWidth, column, objPos;

      tip.css('visibility', 'hidden').show();

      width = target.data('width');
      nub = tip.children('.nub');
      nubHeight = nub.outerHeight();
      nubWidth = nub.outerHeight();

      if (this.small()) {
        tip.css({'width' : '100%' });
      } else {
        tip.css({'width' : (width) ? width : 'auto'});
      }

      objPos = function (obj, top, right, bottom, left, width) {
        return obj.css({
          'top' : (top) ? top : 'auto',
          'bottom' : (bottom) ? bottom : 'auto',
          'left' : (left) ? left : 'auto',
          'right' : (right) ? right : 'auto'
        }).end();
      };

      objPos(tip, (target.offset().top + target.outerHeight() + 10), 'auto', 'auto', target.offset().left);

      if (this.small()) {
        objPos(tip, (target.offset().top + target.outerHeight() + 10), 'auto', 'auto', 12.5, $(this.scope).width());
        tip.addClass('tip-override');
        objPos(nub, -nubHeight, 'auto', 'auto', target.offset().left);
      } else {
        var left = target.offset().left;
        if (Foundation.rtl) {
          nub.addClass('rtl');
          left = target.offset().left + target.outerWidth() - tip.outerWidth();
        }
        objPos(tip, (target.offset().top + target.outerHeight() + 10), 'auto', 'auto', left);
        tip.removeClass('tip-override');
        if (classes && classes.indexOf('tip-top') > -1) {
          if (Foundation.rtl) nub.addClass('rtl');
          objPos(tip, (target.offset().top - tip.outerHeight()), 'auto', 'auto', left)
            .removeClass('tip-override');
        } else if (classes && classes.indexOf('tip-left') > -1) {
          objPos(tip, (target.offset().top + (target.outerHeight() / 2) - (tip.outerHeight() / 2)), 'auto', 'auto', (target.offset().left - tip.outerWidth() - nubHeight))
            .removeClass('tip-override');
          nub.removeClass('rtl');
        } else if (classes && classes.indexOf('tip-right') > -1) {
          objPos(tip, (target.offset().top + (target.outerHeight() / 2) - (tip.outerHeight() / 2)), 'auto', 'auto', (target.offset().left + target#!/bin/sh
#
# An example hook script to check the commit log message.
# Called by "git commit" with one argument, the name of the file
# that has the commit message.  The hook should exit with non-zero
# status after issuing an appropriate message if it wants to stop the
# commit.  The hook is allowed to edit the commit message file.
#
# To enable this hook, rename this file to "commit-msg".

# Uncomment the below to add a Signed-off-by line to the message.
# Doing this in a hook is a bad idea in general, but the prepare-commit-msg
# hook is more suited to it.
#
# SOB=$(git var GIT_AUTHOR_IDENT | sed -n 's/^\(.*>\).*$/Signed-off-by: \1/p')
# grep -qs "^$SOB" "$1" || echo "$SOB" >> "$1"

# This example catches duplicate Signed-off-by lines.

test "" = "$(grep '^Signed-off-by: ' "$1" |
	 sort | uniq -c | sed -e '/^[ 	]*1[ 	]/d')" || {
	echo >&2 Duplicate Signed-off-by lines.
	exit 1
}
                                                                                                                                d({}, self.settings, self.data_options($target));

      if ($tip.find('.tap-to-close').length === 0) {
        $tip.append('<span class="tap-to-close">'+settings.touch_close_text+'</span>');
        $tip.on('click.fndtn.tooltip.tapclose touchstart.fndtn.tooltip.tapclose MSPointerDown.fndtn.tooltip.tapclose', function(e) {
          self.hide($target);
        });
      }

      $target.data('tooltip-open-event-type', 'touch');
    },

    show : function ($target) {
      var $tip = this.getTip($target);

      if ($target.data('tooltip-open-event-type') == 'touch') {
        this.convert_to_touch($target);
      }

      this.reposition($target, $tip, $target.attr('class'));
      $target.addClass('open');
      $tip.fadeIn(150);
    },

    hide : function ($target) {
      var $tip = this.getTip($target);

      $tip.fadeOut(150, function() {
        $tip.find('.tap-to-close').remove();
        $tip.off('click.fndtn.tooltip.tapclose MSPointerDown.fndtn.tapclose');
        $target.removeClass('open');
      });
    },

    off : function () {
      var self = this;
      this.S(this.scope).off('.fndtn.tooltip');
      this.S(this.settings.tooltip_class).each(function (i) {
        $('[' + self.attr_name() + ']').eq(i).attr('title', $(this).text());
      }).remove();
    },

    reflow : function () {}
  };
}(jQuery, window, window.document));
