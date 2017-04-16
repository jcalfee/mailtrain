/* eslint-env browser */
/* eslint prefer-arrow-callback: 0, object-shorthand: 0, new-cap: 0, no-invalid-this: 0, no-var: 0*/
/* globals $: false, moment: false */

'use strict';

(function(){
    function getDataTableOptions(elem) {
        var rowSort = $(elem).data('rowSort') || false;

        var columns = false;

        var sortColumn = $(elem).data('sortColumn') === undefined ? 1 : Number($(elem).data('sortColumn'));
        var sortOrder = ($(elem).data('sortOrder') || 'asc').toString().trim().toLowerCase();

        var paging = $(elem).data('paging') === false ? false : true;

        // allow only asc and desc
        if (sortOrder !== 'desc') {
            sortOrder = 'asc';
        }

        var columnsCount = 0;
        var columnsSort = []

        if (rowSort) {
            columns = rowSort.split(',').map(function (sort) {
                return {
                    orderable: sort === '1'
                };
            });
        }

        return {
            scrollX: true,
            order: [
                [sortColumn, sortOrder]
            ],
            columns: columns,
            paging: paging,
            info: paging, /* This controls the "Showing 1 to 16 of 16 entries" */
            pageLength: 50
        };
    }

    $('.data-table').each(function () {
        var opts = getDataTableOptions(this);
        $(this).DataTable(opts);
    });

    $('.data-table-ajax').each(function () {
        var topicUrl = $(this).data('topicUrl') || '/lists';
        var topicArgs = $(this).data('topicArgs') || false;
        var topicId = $(this).data('topicId') || '';

        var ajaxUrl = topicUrl + '/ajax/' + topicId + (topicArgs ? '?' + topicArgs : '');

        var opts = getDataTableOptions(this);
        opts.ajax = {
            url: ajaxUrl,
            type: 'POST'
        };
        opts.serverSide = true;
        opts.processing = true;

        $(this).DataTable(opts).on('draw', function () {
            $('.datestring').each(function () {
                $(this).html(moment($(this).data('date')).fromNow());
            });
        });
    });
})();

$('.data-stats-pie-chart').each(function () {
    var column = $(this).data('column') || 'country';
    var limit = $(this).data('limit') || 20;
    var topicId = $(this).data('topicId');
    var topicUrl = $(this).data('topicUrl') || '/campaigns/clicked';
    var ajaxUrl = topicUrl + '/ajax/' + topicId + '/stats';
    var self = $(this);

    $.post(ajaxUrl, {column: column, limit: limit}, function(data) {
      google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {
        var gTable = new google.visualization.DataTable();
        gTable.addColumn('string', 'Column');
        gTable.addColumn('number', 'Value');
        gTable.addRows(data.data);

        var options = {'width':500, 'height':400};
        var chart = new google.visualization.PieChart(self[0]);
        chart.draw(gTable, options);
      }
    });
});

$('.datestring').each(function () {
    $(this).html(moment($(this).data('date')).fromNow());
});

$('.delete-form,.confirm-submit').on('submit', function (e) {
    if (!confirm($(this).data('confirmMessage') || 'Are you sure? This action can not be undone')) {
        e.preventDefault();
    }
});

$('.fm-date-us.date').datepicker({
    format: 'mm/dd/yyyy',
    weekStart: 0,
    autoclose: true
});

$('.fm-date-eur.date').datepicker({
    format: 'dd/mm/yyyy',
    weekStart: 1,
    autoclose: true
});

$('.fm-date-generic.date').datepicker({
    format: 'yyyy-mm-dd',
    weekStart: 1,
    autoclose: true
});

$('.fm-birthday-us.date').datepicker({
    format: 'mm/dd',
    weekStart: 0,
    autoclose: true
});

$('.fm-birthday-eur.date').datepicker({
    format: 'dd/mm',
    weekStart: 1,
    autoclose: true
});

$('.fm-birthday-generic.date').datepicker({
    format: 'mm-dd',
    weekStart: 1,
    autoclose: true
});

$('.page-refresh').each(function () {
    var interval = Number($(this).data('interval')) || 60;
    setTimeout(function () {
        window.location.reload();
    }, interval * 1000);
});

$('.click-select').on('click', function () {
    $(this).select();
});

if (typeof moment.tz !== 'undefined') {
    (function () {
        var tz = moment.tz.guess();
        if (tz) {
            $('.tz-detect').val(tz);
        }
    })();
}

// setup SMTP check
var smtpForm = document.querySelector('form#smtp-verify');
if (smtpForm) {
    smtpForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var form = document.getElementById('settings-form');
        var formData = new FormData(form);
        var result = fetch('/settings/smtp-verify', {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });

        var $btn = $('#verify-button').button('loading');

        result.then(function (res) {
            return res.json();
        }).then(function (data) {
            alert(data.error ? 'Invalid Mailer settings\n' + data.error : data.message);
            $btn.button('reset');
        }).catch(function (err) {
            alert(err.message);
            $btn.button('reset');
        });

    });
}
