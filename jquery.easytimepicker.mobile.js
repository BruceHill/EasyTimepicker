/* EasyTimepicker for jQuery Mobile v0.1
 * Automates the substitution of <input type="time"> html elements in jQuery Mobile pages
 * with select elements  having time values separated by a specified interval. 
 * Selection of values in timepickers are propogated back to the underlying input elements, and 
 * updates of input elements with the jQuery val()  method result in the selection of the 
 * closest time entry in the corresponding select element.
 *
 * Copyright (c) 2011 Bruce Hill
 *
 * Dual licensed under the MIT and GPL licenses.
 */

(function($){
	//bind to pagebeforecreate to automatically enhance time inputs
    $( "[data-role=page]" ).live( "pagebeforecreate", function(){
          $( "input[type='time'], input:jqmData(type='time')" ).each(function(){
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