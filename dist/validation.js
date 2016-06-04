/**
 * jQuery Form Validation Plugin
 * An improved form validation plugin for jQuery.
 * 
 * Features:
 * -Full unicode names and emails
 * -Uses CSS classes and data tag attributes (as opposed to an ad hoc config file, like some other plugins)
 * -Does 99% of what most people want for form validation while eliminating complex configuration
 * -Tiny minified footprint
 * -Should work with all versions of jQuery
 * 
 * See readme.md or demo.html for documentation and examples.
 * 
 * This software is released under the following Creative Commons License:
 * Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * http://creativecommons.org/licenses/by-sa/4.0/
 * 
 * @author Shawn Ewald <shawn.ewald@gmail.com>
 */
(function ($) {
    $.validation = {
        passed: false,
        resetCalled: false,
        /**
         * Bind validation to an event.
         * @param {string} containerId - id of form or div containing your input elements.
         * @param {string} event - 'click', 'submit', etc.
         * @param {string} eventElementId - id of element that triggers the event (e.g. id of clicked button, id of form submitted)
         * @param {boolean} flagIfCorrect - add a 'correct-alert' class to form elements if they pass validation.
         * @param {function} callback - A function for submitting the form or whatever callback you prefer.
         * @param {mixed} callbackArg - An argument for the callback function. Need more than one argument? Make the argument an array and process that array as arguments from within your function.
         * @returns {undefined}
         */
        bind: function (containerId, event, eventElementId, flagIfCorrect, callback, callbackArg) {
            $.validation.bindReset();
            $.validation.bindBlur(containerId, flagIfCorrect);
            $('#' + eventElementId).on(event, function () {
                $.validation.run(containerId, flagIfCorrect);
                if (callback) { callback(callbackArg); }
            });
        },
        /**
         * For standard HTML forms that support the submit event.
         * @param {string} containerId
         * @param {boolean} flagIfCorrect
         * @returns {undefined}
         */
        bindOnSubmit: function (containerId, flagIfCorrect) {
            $.validation.bindReset();
            $.validation.bindBlur(containerId, flagIfCorrect);
            $('#' + containerId).on('submit', function (e) {
                $.validation.run(containerId, flagIfCorrect);
                if (!$.validation.passed) { e.preventDefault(); }
            });
        },
        /**
         * For fake, JavaScript driven forms.
         * @param {string} containerId
         * @param {boolean} flagIfCorrect
         * @param {string} returnClass
         * @param {function} callback
         * @param {mixed} callbackArg
         * @returns {undefined}
         */
        bindOnReturn: function (containerId, flagIfCorrect, returnClass, callback, callbackArg) {
            $.validation.bindReset();
            $.validation.bindBlur(containerId, flagIfCorrect);
            $('#' + containerId + ' ' + ((returnClass) ? '.' + returnClass : '.validate')).on('keyup', function (event) {
                if (event.which === 13) {
                    $.validation.run(containerId, flagIfCorrect);
                    if (callback) { callback(callbackArg); }
                }
            });
        },
        run: function (id, flagIfCorrect) {
            $.validation.passed = true;
            var el = $('#' + id + ' .validate');
            $(el).each(function (i, el) {
                if (!$.validation.passed) { return; }
                $.validation.processElement(el, flagIfCorrect);
            });
        },
        bindBlur: function (containerId, flagIfCorrect) {
            // Runs validation when user unfocuses from an input.
            $('#' + containerId + ' .validate').on('blur', function () {
                $.validation.reset(this);
                $.validation.run(containerId, flagIfCorrect);
            });
        },
        bindReset: function () {
            if (!$.validation.resetCalled) {
                $.validation.resetCalled = true;
                $('.validate').on('focus', function () {
                    $.validation.reset(this);
                });
            }
        },
        reset: function (el) {
            $(el).removeClass('correct-alert');
            $(el).removeClass('error-alert');
            $('#' + el.id + '-message').addClass('hidden');
        },
        processElement: function (el, flagIfCorrect) {
            var pass = true;
            var isCheckbox = ($(el).attr('type') === 'checkbox');
            var value = isCheckbox ? null : $(el).val();
            var isNot = isCheckbox ? false : $.validation.checkIfNullOrEmpty(value);
            if ($.validation.passed) {
                if (isNot) { pass = $(el).hasClass('allow-empty'); }
                else {
                    var stop = false;
                    if (pass && isCheckbox && $(el).hasClass('is-checked') && !$.validation.checkIsChecked(el)) {
                        pass = false;
                        stop = true;
                    }
                    else if (isCheckbox) {
                        stop = true;
                    }
                    if ((!stop && pass) && ($(el).hasClass('check-email') && !$.validation.checkEmail(value))) {
                        pass = false;
                    }
                    if ((!stop && pass) && ($(el).hasClass('numbers-only')
                        && !$.validation.checkIfNumbersOnly(value, $(el).hasClass('allow-spaces'), $(el).hasClass('allow-special-characters')))) {
                        pass = false;
                    }
                    if ((!stop && pass) && ($(el).hasClass('letters-only')
                        && !$.validation.checkIfLettersOnly(value,
                            $(el).hasClass('allow-spaces'), $(el).hasClass('allow-special-characters')))) {
                        pass = false;
                    }
                    if ((!stop && pass) && ($(el).hasClass('alphanumeric-only')
                        && !$.validation.checkIfAlphaNumeric(value, $(el).hasClass('allow-spaces')))) {
                        pass = false;
                    }
                    if ((!stop && pass) && ($(el).hasClass('check-length')
                        && !$.validation.checkLength(value,
                            $(el).data('validation-length-min'), $(el).data('validation-length-max')))) {
                        pass = false;
                    }
                    if ((!stop && pass) && ($(el).hasClass('check-match')
                        && !$.validation.checkMatch(value, $(el).data('validation-match')))) {
                        pass = false;
                    }
                }
                if (!pass) { $.validation.showError(el); }
                else if (flagIfCorrect) { $.validation.showCorrect(el); }
                $.validation.passed = pass;
            }
        },
        checkIfNullOrEmpty: function (value) {
            return (typeof value === 'undefined' || !value || (value.length > 0 && !/[^\s]/g.test(value)));
        },
        checkIsChecked: function (el) {
            return $(el).is(':checked');
        },
        checkEmail: function (email) {
            return /^(?!\.)((?!.*\.{2})[a-zA-Z0-9\u0080-\u00FF\u0100-\u017F\u0180-\u024F\u0250-\u02AF\u0300-\u036F\u0370-\u03FF\u0400-\u04FF\u0500-\u052F\u0530-\u058F\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1B00-\u1B7F\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u20D0-\u20FF\u2100-\u214F\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2F00-\u2FDF\u2FF0-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA700-\uA71F\uA800-\uA82F\uA840-\uA87F\uAC00-\uD7AF\uF900-\uFAFF\.+_{|}~\-\d]+)@(?!\.)([a-zA-Z0-9\u0080-\u00FF\u0100-\u017F\u0180-\u024F\u0250-\u02AF\u0300-\u036F\u0370-\u03FF\u0400-\u04FF\u0500-\u052F\u0530-\u058F\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1B00-\u1B7F\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u20D0-\u20FF\u2100-\u214F\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2F00-\u2FDF\u2FF0-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA700-\uA71F\uA800-\uA82F\uA840-\uA87F\uAC00-\uD7AF\uF900-\uFAFF\-\.\d]+)((\.([a-zA-Z\u0080-\u00FF\u0100-\u017F\u0180-\u024F\u0250-\u02AF\u0300-\u036F\u0370-\u03FF\u0400-\u04FF\u0500-\u052F\u0530-\u058F\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1B00-\u1B7F\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u20D0-\u20FF\u2100-\u214F\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2F00-\u2FDF\u2FF0-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA700-\uA71F\uA800-\uA82F\uA840-\uA87F\uAC00-\uD7AF\uF900-\uFAFF]){2,63})+)$/i.test(email);
        },
        checkLength: function (value, min, max) {
            var vlen = value.length;
            var result = true;
            if (min) { result = (vlen >= new Number(min)); }
            if (result && max) { result = (vlen <= new Number(max)); }
            return result;
        },
        checkMatch: function (value, matchId) {
            return (value === $('#' + matchId).val());
        },
        checkIfNumbersOnly: function (value, allowSpaces, allowSpecialCharacters) {
            if (!allowSpaces && !allowSpecialCharacters) {
                return (value !== '' && !isNaN(value));
            }
            else if (allowSpaces && !allowSpecialCharacters) {
                return /^[0-9\s]+$/.test(value);
            }
            else if (!allowSpaces && allowSpecialCharacters) {
                return /^[0-9\-\/\,\.\(\)]+$/.test(value);
            }
            else {
                return /^[0-9\s\-\/\,\.\(\)]+$/.test(value);
            }
        },
        checkIfLettersOnly: function (value, allowSpaces, allowSpecialCharacters) {
            if (!allowSpaces && !allowSpecialCharacters) {
                /^[a-zA-Z]+$/.test(value);
            }
            else if (allowSpaces && !allowSpecialCharacters) {
                return /^[a-zA-Z\s]+$/.test(value);
            }
            else if (!allowSpaces && allowSpecialCharacters) {
                return /^[a-zA-Z0-9\u0080-\u00FF\u0100-\u017F\u0180-\u024F\u0250-\u02AF\u0300-\u036F\u0370-\u03FF\u0400-\u04FF\u0500-\u052F\u0530-\u058F\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1B00-\u1B7F\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u20D0-\u20FF\u2100-\u214F\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2F00-\u2FDF\u2FF0-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA700-\uA71F\uA800-\uA82F\uA840-\uA87F\uAC00-\uD7AF\uF900-\uFAFF\'\-\_]$/i.test(value);
            }
            else {
                return /^[\sa-zA-Z0-9\u0080-\u00FF\u0100-\u017F\u0180-\u024F\u0250-\u02AF\u0300-\u036F\u0370-\u03FF\u0400-\u04FF\u0500-\u052F\u0530-\u058F\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1B00-\u1B7F\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u20D0-\u20FF\u2100-\u214F\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2F00-\u2FDF\u2FF0-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA700-\uA71F\uA800-\uA82F\uA840-\uA87F\uAC00-\uD7AF\uF900-\uFAFF\'\-\_]$/i.test(value);
            }
        },
        checkIfAlphaNumeric: function (value, allowSpaces) {
            return allowSpaces
                ? /^[\sa-zA-Z0-9\u0080-\u00FF\u0100-\u017F\u0180-\u024F\u0250-\u02AF\u0300-\u036F\u0370-\u03FF\u0400-\u04FF\u0500-\u052F\u0530-\u058F\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1B00-\u1B7F\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u20D0-\u20FF\u2100-\u214F\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2F00-\u2FDF\u2FF0-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA700-\uA71F\uA800-\uA82F\uA840-\uA87F\uAC00-\uD7AF\uF900-\uFAFF]+$/i.test(value)
                : /^[a-zA-Z0-9\u0080-\u00FF\u0100-\u017F\u0180-\u024F\u0250-\u02AF\u0300-\u036F\u0370-\u03FF\u0400-\u04FF\u0500-\u052F\u0530-\u058F\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u0780-\u07BF\u07C0-\u07FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0E80-\u0EFF\u0F00-\u0FFF\u1000-\u109F\u10A0-\u10FF\u1100-\u11FF\u1200-\u137F\u1380-\u139F\u13A0-\u13FF\u1400-\u167F\u1680-\u169F\u16A0-\u16FF\u1700-\u171F\u1720-\u173F\u1740-\u175F\u1760-\u177F\u1780-\u17FF\u1800-\u18AF\u1900-\u194F\u1950-\u197F\u1980-\u19DF\u19E0-\u19FF\u1A00-\u1A1F\u1B00-\u1B7F\u1D00-\u1D7F\u1D80-\u1DBF\u1DC0-\u1DFF\u1E00-\u1EFF\u1F00-\u1FFF\u20D0-\u20FF\u2100-\u214F\u2C00-\u2C5F\u2C60-\u2C7F\u2C80-\u2CFF\u2D00-\u2D2F\u2D30-\u2D7F\u2D80-\u2DDF\u2F00-\u2FDF\u2FF0-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3130-\u318F\u3190-\u319F\u31C0-\u31EF\u31F0-\u31FF\u3200-\u32FF\u3300-\u33FF\u3400-\u4DBF\u4DC0-\u4DFF\u4E00-\u9FFF\uA000-\uA48F\uA490-\uA4CF\uA700-\uA71F\uA800-\uA82F\uA840-\uA87F\uAC00-\uD7AF\uF900-\uFAFF]+$/.test(value);
        },
        showError: function (el) {
            var id = $(el).attr('id');
            var message = $(el).data('error-message');
            $(el).addClass('error-alert');
            if (message) { $('#' + id + '-message').html(message); }
            $('#' + id + '-message').removeClass('hidden');
        },
        showCorrect: function (el) { $(el).addClass('correct-alert'); }
    };
}(jQuery));