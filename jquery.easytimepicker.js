/* jQuery EasyTimepicker v0.1
 * https://github.com/BruceHill/EasyTimepicker
 *
 * Copyright (c) 2011 Bruce Hill
 *
 * Dual licensed under the MIT and GPL licenses.
 */
(function($){
    var _uuid = new Date().getTime();
	var _maxMinutes = 1439; /* minutes calculations are zero indexed, therefore 0 to 1439 minutes = 1440 minutes = 24 hours */
	var _maxInterval = 1440;
	var _pickerPrefix = "picker_";
	var _hasPickerClass = "easytimepicker-haspicker";
	var _defaultOptions = {
	   interval: 15,
	   display24Hour: false,
	   value24Hour: true,
	   nativeMenu: true
	};
	
	// Override val
	var originalVal = $.fn.val;
    $.fn.val = function(value) {
		if (typeof value != 'undefined') { /* setter invoked */
		   var get0 = this.get(0);
		   if (get0 && get0.className.indexOf(_hasPickerClass) != -1) {
			  _setTimeFieldFromVal(get0, value);
			  return this;
		   }
		   else {
		     return originalVal.call(this, value);
		   }
		}
		return originalVal.call(this);
	};

    function _zeroFill(val)
	{
	   return (val < 10)? "0"+val: val; 
	}
	
	function _toInt(val, def)
	{
	   var typeIs = typeof val;
	   if (typeIs == 'number') return val;
	   var asInt = parseInt(val, 10);
	   if (asInt != NaN) return asInt;
       return def;	   
	}
	
	function _toBool(val, def)
	{
	   var typeIs = typeof val;
	   if (typeIs == 'boolean') return val;
	   if (typeIs == 'string') return (val.toLowerCase() == 'true');
       return def;
	}
	
	function _to12HourTime(time)
	{
	   if (typeof time != 'string' || time.length !=5) return time;
	   var timeComponents = time.split(':');
	   var hours = parseInt(timeComponents[0], 10);
	   return ((hours > 12)? _zeroFill(hours-12):timeComponents[0])+':'+timeComponents[1]+' '+((hours > 11)?'PM':'AM');
	}
	
	function _to24HourTime(val)
	{
	   val = val.replace(' ','');
	   var isPM = (val.substr(5,2).toLowerCase() == 'pm');
	   var hrs = parseInt(val.substr(0,2), 10);
	   if (hrs == NaN) return null;
	   return _zeroFill((isPM && hrs != 12)?(hrs+12):hrs)+val.substr(2,3);
	}
	
	function _to24HourFromMinutes(i)
	{
	   var hours = Math.floor(i / 60);
	   var mins = i % 60;
	   return _zeroFill(hours) + ":" + _zeroFill(mins);
	}
	
	function _formatTime(time, format24Hour)
	{
	   return (format24Hour)? time: _to12HourTime(time);
	}
	
	function _addDefaultOptions(options)
	{
	   var op = options || _defaultOptions;
	   op.interval = _toInt(op.interval || _defaultOptions.interval, _defaultOptions.interval);
	   op.interval = (op.interval < 1 || op.interval > _maxInterval)? _defaultOptions.interval: op.interval;
	   op.nativeMenu = _toBool(op.nativeMenu || _defaultOptions.nativeMenu, _defaultOptions.nativeMenu);
	   op.display24Hour = _toBool(op.display24Hour || _defaultOptions.display24Hour, _defaultOptions.display24Hour);
	   op.value24Hour = _toBool(op.value24Hour || _defaultOptions.value24Hour, _defaultOptions.value24Hour);
	   return op;
	}

	function _extract24HourTime(val)
	{
	    if (!val) return null;
		if (val.length == 1) {
		    val = "0"+val+":00";
		}
		if (val.length == 2) {
		    val += ":00";
		}		
		if (val.length == 7 || val.length == 8) {
		    val = _to24HourTime(val);
		}
		
	    var hrs = parseInt(val.substr(0,2), 10);
		if (hrs == NaN) return null;
		if (hrs > 23) return null;
		var colon = val.substr(2,1);
		if (colon != ':') return null;
		var min = parseInt(val.substr(3,2), 10);
		if (min == NaN) return null;
		if (min > 59) return null;
		return new Date(1959,2,3,hrs,min,0, 0);
	}
	
	function _roundMinutesToClosestInterval(min, interval)
    {
       return interval * Math.floor(min/interval)+parseInt(min%interval < (interval/2) ? 0 : interval);
    }
	
	function _roundTimeToClosestInterval(time, interval)
	{
	    var mins = time.getHours()*60 + time.getMinutes();
	    //round mins up or down to nearest interval
		var mins = _roundMinutesToClosestInterval(mins, interval);
		// check for minutes exceeding _maxMinutes (24 hours)
		while (mins > _maxMinutes) {
		   mins = ((mins/interval) - 1) * interval;
		}
	    return _to24HourFromMinutes(mins);
	}
	
	function _buildSelectDomObject(id, toSetTimeValue, interval, nativeMenu, display24Hour)
	{
	    var output = '';
		var currentTimeEntry;
	    output += '<select id="' + id + '" class="timepicker" data-native-menu="'+nativeMenu.toString()+'">';
        for (var i=0; i<=_maxMinutes; i+=interval)
		{
		    currentTimeEntry = _to24HourFromMinutes(i);
			output += '<option value="' + currentTimeEntry + '"';
			if(currentTimeEntry == toSetTimeValue) {
    			output += ' selected';
			}
		 	output += '>' + _formatTime(currentTimeEntry, display24Hour) + '</option>';
		}
		output += '</select>';
		return output;
	}
	
	function _setTimeFieldFromVal(timeField, value)
	{
	    var pickerId = _pickerPrefix+timeField.id;
		var extractedTime = _extract24HourTime(value);
		if (extractedTime) { /* if the extract time was invalid then this will be null */
		   var toSetTimeValue = _roundTimeToClosestInterval(extractedTime, timeField.interval);
		   $("#"+pickerId).val(toSetTimeValue).selectmenu('refresh'); /* Note, this doesn't cause an infinite loop, as setting val doesn't fire the pickers onchange event */
		   timeField.value = _formatTime(toSetTimeValue, timeField.value24Hour);  /* IMPORTANT!! we use 'value' attribute here jquery val() method to prevent an infinite recursive loop to _setTimeFieldFromVal */
	    }
	}
	
	function _setTimeFieldFromPicker(picker)
	{
	    var inputId = picker.id.substr(_pickerPrefix.length);
	    var value24Hour = $('#' + inputId).get(0).value24Hour;
		var selectedTime = _formatTime($(picker).val(), value24Hour);
		$('#' + inputId).get(0).value = selectedTime;  /* use get(0) here and not jquery val() method to prevent a needless recursive call to _setTimeFieldFromVal */
	}
	
	$.fn.easytimepicker = function(options){
	    var defaultedOptions = _addDefaultOptions(options);
		this.each(function(){
		    this.id = this.id || ++_uuid;
			this.value24Hour = defaultedOptions.value24Hour;
			this.interval = defaultedOptions.interval;
			var $this = $(this);
			var timefieldId = this.id;
			var pickerId = _pickerPrefix+timefieldId;
			var toSetTimeValue = _roundTimeToClosestInterval(_extract24HourTime($this.val()) || new Date, defaultedOptions.interval);
			// Create picker in dom
			$this.attr('style','display:none')
			     .after(_buildSelectDomObject(pickerId, 				        
						                      toSetTimeValue, 
											  defaultedOptions.interval,
											  defaultedOptions.nativeMenu,
											  defaultedOptions.display24Hour));
			// Change labels to associate with picker instead of hidden time field
			$('label[for='+timefieldId+']').attr('for', pickerId);
			// Add class to flag time field as having a picker
			$this.addClass(_hasPickerClass);
			// Save the selected time to the time field
			this.value = _formatTime(toSetTimeValue, this.value24Hour);
		});
		
		$('select.timepicker').change(function(){
			_setTimeFieldFromPicker(this);
		});
		return this;
	};
})(jQuery);