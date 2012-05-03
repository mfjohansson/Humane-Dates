/*
 * Javascript Humane Dates
 * Copyright (c) 2008 Dean Landolt (deanlandolt.com)
 * Re-write by Zach Leatherman (zachleat.com)
 * Re-write by Magnus Johansson (mfjohansson.nu)
 *
 * Adopted from the John Resig's pretty.js
 * at http://ejohn.org/blog/javascript-pretty-date
 * and henrah's proposed modification
 * at http://ejohn.org/blog/javascript-pretty-date/#comment-297458
 *
 * Licensed under the MIT license.
 */

function humaneDateObject(date, compareTo){

    if(!date || !lang) {
        return;
    }

    var formats = [
            [60, lang.now, lang.now, 0, "red"],
            [3600, lang.minute, lang.minutes, 60, "red"], // 60 minutes, 1 minute
            [86400, lang.hour, lang.hours, 3600, "red"], // 24 hours, 1 hour
            [604800, lang.day, lang.days, 86400, "yellow"], // 7 days, 1 day
            [2628000, lang.week, lang.weeks, 604800, ""], // ~1 month, 1 week
            [31536000, lang.month, lang.months, 2628000, ""], // 1 year, ~1 month
            [Infinity, lang.year, lang.years, 31536000, ""] // Infinity, 1 year
        ],
        isString = typeof date == 'string',
        date = isString ?
                    new Date(('' + date).replace(/-/g,"/").replace(/[TZ]/g," ")) :
                    date,
        compareTo = compareTo || new Date,
        seconds = (compareTo - date +
                        (compareTo.getTimezoneOffset() -
                            // if we received a GMT time from a string, doesn't include time zone bias
                            // if we got a date object, the time zone is built in, we need to remove it.
                            (isString ? 0 : date.getTimezoneOffset())
                        ) * 60000
                    ) / 1000,
        token;

    if(seconds < 0) {
        seconds = Math.abs(seconds);
        token = lang.from ? ' ' + lang.from : '';
    } else {
        token = lang.ago ? ' ' + lang.ago : '';
    }

    /*
     * 0 seconds && < 60 seconds        Now
     * 60 seconds                       1 Minute
     * > 60 seconds && < 60 minutes     X Minutes
     * 60 minutes                       1 Hour
     * > 60 minutes && < 24 hours       X Hours
     * 24 hours                         1 Day
     * > 24 hours && < 7 days           X Days
     * 7 days                           1 Week
     * > 7 days && < ~ 1 Month          X Weeks
     * ~ 1 Month                        1 Month
     * > ~ 1 Month && < 1 Year          X Months
     * 1 Year                           1 Year
     * > 1 Year                         X Years
     *
     * Single units are +40%. 1 Year shows first at 1 Year + 40%
     */

    function normalize(val, single)
    {
        var margin = 0.4;
        if(val >= single && val <= single * (1+margin)) {
            return single;
        }
        return val;
    }
    
    var return_date = {date: "", css_class:""};

    for(var i = 0, format = formats[0]; formats[i]; format = formats[++i]) {
        if(seconds < format[0]) {            
            return_date.css_class = format[4];
            return_date.real_date = date;
            
            if(i === 0) {
                // Now
                return_date.date = format[1];
                return return_date;
            }

            var val = Math.ceil(normalize(seconds, format[3]) / (format[3]));
            return_date.date = val + ' ' + (val != 1 ? format[2] : format[1]) + (i > 0 ? token : '');
            
            return return_date;
        }
    }
};

function humaneDate(date, compareTo){
    var compareTo = compareTo || new Date;
    var date = humaneDateObject(date, compareTo);
    return date.date;
}

if(typeof jQuery != 'undefined') {
    jQuery.fn.humaneDates = function(options)
    {
        var settings = jQuery.extend({
            'lowercase': false
        }, options);

        return this.each(function()
        {
            var $t = jQuery(this),
                date = $t.attr('datetime') || $t.attr('title');

            date = humaneDateObject(date);

            if(date && settings['lowercase']) {
                date.date = date.date.toLowerCase();
            }

            if(date && $t.html() != date) {
                // don't modify the dom if we don't have to
                $t.html(date.date);
                $t.addClass(date.css_class);
            }
        });
    };
}
