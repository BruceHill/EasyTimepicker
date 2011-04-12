/* EasyTimepicker for jQuery Mobile v0.1
 * https://github.com/BruceHill/EasyTimepicker
 *
 * Copyright (c) 2011 Bruce Hill
 *
 * Dual licensed under the MIT and GPL licenses.
 */
(function($){
	// Bind to pagebeforecreate to automatically enhance time inputs
    $( "[data-role=page]" ).live( "pagebeforecreate", function(){
          $( "input[type='time']" ).each(function(){
		     var $this = $(this);
		     if (!$this.hasClass("easytimepicker-haspicker")) {
		         $options = { 
			                   'interval': $this.attr('data-interval'),
					   	     'nativeMenu': $this.attr('data-native-menu'),
						     'display24Hour': $this.attr('data-display-24hour'),
						     'value24Hour': $this.attr('data-value-24hour')
						  };
			     $this.easytimepicker($options);
			 }
          });
    });
})(jQuery);