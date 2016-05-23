## jQuery Form Validation Plugin
 An improved form validation plugin for jQuery.
 
Features:
- Full unicode names and emails
- Uses CSS classes and data tag attributes (as opposed to an ad hoc config file, like some other plugins)
- Does 99% of what most people want for form validation while eliminating complex configuration
- Tiny minified footprint
- Should work with all versions of jQuery

> This software is released under the following Creative Commons License:
>
> Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
>
> http://creativecommons.org/licenses/by-sa/4.0/

Please see demo/docs_and_demo.html for full documentation and demos.

#### Sample usage on an HTML form:

```
<form name="sample_form" action="#" method="post" id="sample_form">
    <div>

        <input type="text" name="your_name" id="your_name" placeholder="Enter your name."
        class="validate letters-only allow-spaces check-length"
        data-validation-length-min="3" data-validation-length-max="100">

        <div id="your_name-message" class="error-message hidden">You must enter a name between 3 and 100 characters.</div>

    </div>
    <div>

        <input type="text" name="email" id="email" placeholder="Enter your email."
        class="validate check-email" data-error-message="You must enter a valid email address.">

        <div id="email-message" class="error-message hidden"></div>

    </div>
    <div>

        <input type="checkbox" name="my_checkbox" id="my_checkbox"
        class="validate is-checked" data-error-message="This box must be checked.">

         <div id="my_checkbox-message" class="error-message hidden"></div> Check this box.

    </div>

    <button type="submit" name="form_submit" id="form_submit">Submit</button>
</form>

<script>$.validation.bindOnSubmit('sample_form', true, true);</script>
```

#### Sample usage on a div container:

```
<div id="form_container">
    <div>
    
    <input type="text" name="your_email" id="your_email" placeholder="Enter your email."
        class="validate check-email" data-error-message="You must enter a valid email address.">
    
    <div id="your_email-message" class="error-message hidden"></div>
    
    </div>
    <div>
    
    <input type="password" name="your_password" id="your_password"
        placeholder="Enter your password." class="validate check-length" data-validation-length-min="8"
        data-error-message="You must enter a password that is at least 8 characters long.">
    
    <div id="your_password-message" class="error-message hidden"></div>
    
    </div>
    <div>

        <input type="password" name="your_password_match" id="your_password_match"
        placeholder="Repeat your password." class="validate check-match" data-validation-match="your_password"
        data-error-message="Passwords do not match">

        <div id="your_password_match-message" class="error-message hidden"></div>

    </div>
    <div>
    
    <select name="select_stuff" id="select_stuff" class="validate"
        data-error-message="You must select something!">
        <option value="">Select something</option>
        <option value="stuff">Stuff</option>
        <option value="things">Things</option>
    </select>
        
    <div id="select_stuff-message" class="error-message hidden"></div>
    
    </div>
    <div>
    <button type="button" name="submit_form" id="submit_form">Submit</button>
    </div>
</div>

<script>
// Will execute callback function when user presses return in an input field.
$.validation.bindOnReturn('form_container', true, true, null, submitForm);

// Catch the submit button click and call submit function
$.validation.bind('form_container', 'click', 'submit_form', true, submitForm);

function submitForm() {
    // put your Ajax POST code here.
    
    // make sure that the validation plugin ran and the form passed the tests
    if ($.validation.ran && $.validation.passed) {
        var email = $('#your_email').val();
        var password = $('#your_password').val();
        var stuff = $('#select_stuff').val();
        alert('Form passed validation! Values: '+email+':'+password+':'+stuff);
    }
}
</script>
```