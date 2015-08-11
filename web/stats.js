var allTimeSeries = {};
var allValueLabels = {};
var descriptions = {
    'Delivered': {
        'mon': 'Number of processes waiting for run time',
        'zom': 'Number of processes in uninterruptible sleep'
    },
    'Dropped': {
        'ghi': 'Number of processes waiting for run time',
        'jkl': 'Number of processes in uninterruptible sleep'
    },
    'Processed': {
        'abc': 'Number of processes waiting for run time',
        'def': 'Number of processes in uninterruptible sleep'
    }
}

function streamStats() {

    var ws = new ReconnectingWebSocket('ws://' + location.host + '/');
    var lineCount;
    var colHeadings;

    ws.onopen = function() {
        console.log('connect');
        lineCount = 0;
    };

    ws.onclose = function() {
        console.log('disconnect');
    };

    ws.onmessage = function(e) {
	var stats = {};
	stats["abc"] = Math.random() * 5;
	stats["def"] = Math.random() * 17;
	stats["ghi"] = Math.random() * 11;
	stats["jkl"] = Math.random() * 10;
	stats["mon"] = Math.random() * 10;
	stats["zom"] = Math.random() * 10;
	console.log(stats);
	receiveStats(stats);

	/*
        switch (lineCount++) {
            case 0: // ignore first line
                break;

            case 1: // column headings
                colHeadings = e.data.trim().split(/ +/);
                break;

            default: // subsequent lines
                var colValues = e.data.trim().split(/ +/);
                var stats = {};
                for (var i = 0; i < colHeadings.length; i++) {
                    stats[colHeadings[i]] = parseInt(colValues[i]);
                }
                receiveStats(stats);
        }
	*/
    };
}

function initCharts() {
    Object.each(descriptions, function(sectionName, values) {
        var section = $('.chart.template').clone().removeClass('template').appendTo('#charts');

        section.find('.title').text(sectionName);

        var smoothie = new SmoothieChart({
            grid: {
                sharpLines: true,
                verticalSections: 5,
                strokeStyle: 'rgba(119,119,119,0.45)',
                millisPerLine: 1000
            },
            minValue: 0,
            labels: {
                disabled: true
            }
        });
        smoothie.streamTo(section.find('canvas').get(0), 1000);

        var colors = chroma.brewer['Pastel2'];
        var index = 0;
        Object.each(values, function(name, valueDescription) {
            var color = colors[index++];

            var timeSeries = new TimeSeries();
            smoothie.addTimeSeries(timeSeries, {
                strokeStyle: color,
                fillStyle: chroma(color).darken().alpha(0.5).css(),
                lineWidth: 3
            });
            allTimeSeries[name] = timeSeries;

            var statLine = section.find('.stat.template').clone().removeClass('template').appendTo(section.find('.stats'));
            statLine.attr('title', valueDescription).css('color', color);
            statLine.find('.stat-name').text(name);
            allValueLabels[name] = statLine.find('.stat-value');
        });
    });
}

function receiveStats(stats) {
    Object.each(stats, function(name, value) {
        var timeSeries = allTimeSeries[name];
        if (timeSeries) {
            //timeSeries.append(Date.now(), value);
            timeSeries.append(Date.now(), value);
            //allValueLabels[name].text(value);
        }
    });
}

$(function() {
    initCharts();
    streamStats();
});
