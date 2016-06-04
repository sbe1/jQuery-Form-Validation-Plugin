$.validation.bindOnSubmit('sample_form', true);
// Preventing form submission as this is merely a demo.
// You won't need to add something like this with a real form.
$('#sample_form').on('submit', function (e) {
    e.preventDefault();
    if ($.validation.passed) {
        alert('This form would have submitted successfully because it passed validation.');
    }
});

// Will execute callback function when user presses return in an input field.
$.validation.bindOnReturn('form_container', true, null, submitForm);
// Catch the submit button click and call submit function
$.validation.bind('form_container', 'click', 'submit_form', true, submitForm);

function submitForm () {
    // put your Ajax POST code here.

    // make sure that the validation plugin ran and the form passed the tests
    if ($.validation.passed) {
        var email = $('#your_email').val();
        var password = $('#your_password').val();
        var stuff = $('#select_stuff').val();
        alert('Form passed validation! Values: ' + email + ' | ' + password + ' | ' + stuff);
    }
}