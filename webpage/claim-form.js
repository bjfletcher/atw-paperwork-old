/*
Coding approach:
- all DOM elements used in this JS are accessed through a global variable `elements` (see below)
- no other global variables are allowed, use events/listeners only... constants are ok (use capitals)
- aim for vanilla JS (no transpilation) that'll also work in old IE
- use listener pattern for comms across fields and not direct calls
 */

var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function Elements() {
    // a shortcut for document.querySelector because my fingers hurt
    function s(str) {
        return document.querySelector('[' + str + ']');
    }
    this.claimPeriod = {
        weekly: s('data-claim-form-weekly-option'),
        monthly: s('data-claim-form-monthly-option')
    };
    this.claimType = {
        support: s('data-claim-form-support-option'),
        travel: s('data-claim-form-travel-option')
    };
    this.weekend = s('data-claim-form-weekend');
    this.weekendLabel = s('data-claim-form-weekend-label');
    this.weeks = {
        inputs: [
            s('data-claim-week-input-a'),
            s('data-claim-week-input-b'),
            s('data-claim-week-input-c'),
            s('data-claim-week-input-d')
        ],
        labels: [
            s('data-claim-week-label-a'),
            s('data-claim-week-label-b'),
            s('data-claim-week-label-c'),
            s('data-claim-week-label-d')
        ]
    };
    this.months = {
        inputs: [
            s('data-claim-month-input-a'),
            s('data-claim-month-input-b'),
            s('data-claim-month-input-c'),
            s('data-claim-month-input-d')
        ],
        labels: [
            s('data-claim-month-label-a'),
            s('data-claim-month-label-b'),
            s('data-claim-month-label-c'),
            s('data-claim-month-label-d')
        ]
    };
    this.from = s('data-claim-form-from');
    this.to = s('data-claim-form-to');
    this.periodSelection = {
        week: s('data-claim-form-week-selection'),
        month: s('data-claim-form-month-selection')
    };
    this.claimList = s('data-claim-form-detail-list');
    this.templates = {
        weekHeading: s('data-claim-form-sublist-template'),
        hoursCosts: s('data-claim-form-detail'),
        journeyCost: s('data-claim-form-journey-detail'),
        subList: s('data-claim-form-sublist-template')
    };
    this.save = s('data-claim-form-save');
    this.form = s('data-claim-form-form');
}
var elements = new Elements();

function UserLocalStorage() {
    if ('localStorage' in window) {
        var fields = [
            'first-name',
            'last-name',
            'email',
            'ref-no',
            'payment-to',
            'name',
            'position',
            'address'
        ];
        var key = 'details';
        function init() {
            // check it's in storage... populate all fields
            var details = JSON.parse(localStorage.getItem(key));
            if (details) {
                for (var i = 0; i < fields.length; i++) {
                    var storedValue = details[fields[i]];
                    if (storedValue) {
                        document.forms[0][fields[i]].value = storedValue;
                    }
                }
                elements.save.checked = true;
            }
        }
        function checkSave() {
            if (elements.save.checked) {
                var details = {};
                for (var j = 0; j < fields.length; j++) {
                    var formValue = document.forms[0][fields[j]].value;
                    if (formValue) {
                        details[fields[j]] = formValue;
                    }
                }
                localStorage.setItem(key, JSON.stringify(details));
            } else {
                localStorage.removeItem(key);
            }
        }
        function setupListeners() {
            elements.save.addEventListener('change', checkSave);
            elements.form.addEventListener('submit', checkSave);
        }
        init();
        setupListeners();
    }
}
new UserLocalStorage();

function Weekend() {
    function setupListeners() {
        // singularity or plurality of Saturday & Sunday
        function weeklyOrMonthly() {
            if (elements.claimPeriod.weekly.checked) {
                elements.weekendLabel.innerText = 'Include Saturday and Sunday';
            } else {
                elements.weekendLabel.innerText = 'Include Saturdays and Sundays';
            }
        }
        elements.claimPeriod.weekly.addEventListener('change', weeklyOrMonthly);
        elements.claimPeriod.monthly.addEventListener('change', weeklyOrMonthly);
    }
    setupListeners();
}
new Weekend();

function WeekSelection() {
    var self = this;
    self.selected = null;
    self.listeners = [];
    function formatDate(date) {
        return DAYS[date.getDay()] + ' ' + date.getDate() + ' ' + MONTHS[date.getMonth()];
    }
    function populateSelection() {
        var date = new Date();
        // week needs to end on a Sunday, in the future if necessary
        while (date.getDay() !== 0) {
            date.setDate(date.getDate() + 1);
        }
        for (var i = 0; i < 4; i++) {
            if (elements.weekend.checked) {
                var endWeek = formatDate(date);
                date.setDate(date.getDate() - 6); // Monday
            } else {
                date.setDate(date.getDate() - 2); // skip Sunday & Saturday
                var endWeek = formatDate(date);
                date.setDate(date.getDate() - 4); // Monday
            }
            elements.weeks.labels[i].innerText = formatDate(date) + ' ' + endWeek;
            elements.weeks.inputs[i].value = date.getTime() + '';
            if (!self.selected) {
                // the first week is selected in HTML and this JS
                self.selected = new Date(date.getTime());
            }
            date.setDate(date.getDate() - 1); // Sunday
        }
    }
    function setupListeners() {
        // update `selected` and alert listeners when selection change
        for (var i = 0; i < 4; i++) {
            elements.weeks.inputs[i].addEventListener('change', function() {
                self.selected = new Date(parseInt(this.value, 10));
                for (var j = 0; j < self.listeners.length; j++) {
                    self.listeners[j](self.selected);
                }
            });
        }
        // show week selection if weekly is selected as claim period
        function weeklyOrMonthly() {
            elements.periodSelection.week.classList.toggle('claim-form__select-week--is-hidden',
                    !elements.claimPeriod.weekly.checked);
        }
        elements.claimPeriod.weekly.addEventListener('change', weeklyOrMonthly);
        elements.claimPeriod.monthly.addEventListener('change', weeklyOrMonthly);
        // show/hide Satudays/Sundays
        elements.weekend.addEventListener('change', populateSelection);
    }
    populateSelection();
    setupListeners();
}
var weekSelection = new WeekSelection();

function MonthSelection() {
    var self = this;
    self.selected = null;
    self.listeners = [];
    function populateSelection() {
        var date = new Date();
        for (var i = 0; i < 4; i++) {
            elements.months.labels[i].innerText = MONTHS[date.getMonth()];
            if (date.getFullYear() !== new Date().getFullYear()) {
                elements.months.labels[i].innerText += ' ' + date.getFullYear();
            }
            elements.months.inputs[i].value = date.getTime() + '';
            if (!self.selected) {
                // the first month is selected in HTML and this JS
                self.selected = new Date(date.getTime());
            }
            date.setMonth(date.getMonth() - 1);
        }
    }
    function setupListeners() {
        // update `selected` and alert listeners when selection change
        for (var i = 0; i < 4; i++) {
            elements.months.inputs[i].addEventListener('change', function() {
                self.selected = new Date(parseInt(this.value, 10));
                for (var j = 0; j < self.listeners.length; j++) {
                    self.listeners[j](self.selected);
                }
            });
        }
        // show month selection if monthly is selected as claim period
        function weeklyOrMonthly() {
            elements.periodSelection.month.classList.toggle('claim-form__select-month--is-hidden',
                    !elements.claimPeriod.monthly.checked);
        }
        elements.claimPeriod.weekly.addEventListener('change', weeklyOrMonthly);
        elements.claimPeriod.monthly.addEventListener('change', weeklyOrMonthly);
    }
    populateSelection();
    setupListeners();
}
var monthSelection = new MonthSelection();

function WeekDetails() {
    function createView(weekMonday, includeWeekend, travel) {
        function formatDate(date) {
            return DAYS[date.getDay()] + ' ' + date.getDate();
        }
        function atwDate(date) {
            return date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
        }
        if (!elements.claimPeriod.weekly.checked) {
            // claim period is monthly, don't render anything
            return;
        }
        while (elements.claimList.lastChild) {
            elements.claimList.removeChild(elements.claimList.lastChild);
        }
        var detailTemplate = travel ? elements.templates.journeyCost : elements.templates.hoursCosts;
        var currentDate = new Date(weekMonday);
        for (var i = 0; i < (includeWeekend ? 7 : 5); i++) {
            var clone = detailTemplate.cloneNode(true);
            clone.querySelector('[data-claim-form-detail-date]').innerText = formatDate(currentDate);
            if (!travel) {
                // support worker... so hours & cost
                clone.querySelector('[data-claim-form-detail-hours-label]').setAttribute('for', 'detail-hours-' + i);
                clone.querySelector('[data-claim-form-detail-hours-input]').id = 'detail-hours-' + i;
                clone.querySelector('[data-claim-form-detail-hours-input]').name = 'detail-hours-' + atwDate(currentDate);
                clone.querySelector('[data-claim-form-detail-costs-label]').setAttribute('for', 'detail-costs-' + i);
                clone.querySelector('[data-claim-form-detail-costs-input]').id = 'detail-costs-' + i;
                clone.querySelector('[data-claim-form-detail-costs-input]').name = 'detail-costs-' + atwDate(currentDate);
            } else {
                // travel... so cost
                clone.querySelector('[data-claim-form-detail-am-label]').setAttribute('for', 'detail-am-' + i);
                clone.querySelector('[data-claim-form-detail-am-input]').id = 'detail-am-' + i;
                clone.querySelector('[data-claim-form-detail-am-input]').name = 'detail-am-' + atwDate(currentDate);
                clone.querySelector('[data-claim-form-detail-pm-label]').setAttribute('for', 'detail-pm-' + i);
                clone.querySelector('[data-claim-form-detail-pm-input]').id = 'detail-pm-' + i;
                clone.querySelector('[data-claim-form-detail-pm-input]').name = 'detail-pm-' + atwDate(currentDate);
            }
            clone.classList.remove('claim-form__claim-week-detail--is-hidden');
            elements.claimList.appendChild(clone);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }
    function setupListeners() {
        // show month selection if weekly is selected as claim period
        elements.claimPeriod.weekly.addEventListener('change', function () {
            createView(weekSelection.selected, elements.weekend.checked, elements.claimType.travel.checked);
        });
        // update view when Saturday/Sunday option changes
        elements.weekend.addEventListener('change', function() {
            createView(weekSelection.selected, elements.weekend.checked, elements.claimType.travel.checked);
        });
        // update view when a week is selected
        weekSelection.listeners.push(function () {
            createView(weekSelection.selected, elements.weekend.checked, elements.claimType.travel.checked);
        });
        // update view when claim form type changes (support vs support worker)
        elements.claimType.support.addEventListener('change', function () {
            createView(weekSelection.selected, elements.weekend.checked, elements.claimType.travel.checked);
        });
        elements.claimType.travel.addEventListener('change', function () {
            createView(weekSelection.selected, elements.weekend.checked, elements.claimType.travel.checked);
        });
    }
    createView(weekSelection.selected, elements.weekend.checked, elements.claimType.travel.checked);
    setupListeners();
}
new WeekDetails();

function FromTo() {
    function atwDate(date) {
        return date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
    }
    function setWeekDates() {
        elements.from.value = atwDate(weekSelection.selected);
        var to = new Date(weekSelection.selected.getTime());
        if (elements.weekend.checked) {
            to.setDate(to.getDate() + 6);
        } else {
            to.setDate(to.getDate() + 4);
        }
        elements.to.value = atwDate(to);
    }
    function setMonthDates() {
        var from = new Date(monthSelection.selected.getTime());
        from.setDate(1);
        elements.from.value = atwDate(from);
        var to = new Date(monthSelection.selected.getTime());
        to.setDate(1);
        to.setMonth(to.getMonth() + 1);
        to.setDate(to.getDate() - 1);
        elements.to.value = atwDate(to);
    }
    function setupListeners() {
        // update range when claim period chagnes to monthly
        elements.claimPeriod.monthly.addEventListener('change', setMonthDates);
        // update range when a month is selected
        monthSelection.listeners.push(setMonthDates);
        // update range when claim period changes to weekly
        elements.claimPeriod.weekly.addEventListener('change', setWeekDates);
        // update range when a week is selected
        weekSelection.listeners.push(setWeekDates);
        // update view when Saturday/Sunday option changes
        elements.weekend.addEventListener('change', function () {
            if (elements.claimPeriod.weekly.checked) {
                setWeekDates();
            } else {
                setMonthDates();
            }
        });
    }
    setWeekDates();
    setupListeners();
}
new FromTo();

function MonthDetails() {
    function createView(month, includeWeekend, travel) {
        function formatDate(date) {
            return DAYS[date.getDay()] + ' ' + date.getDate();
        }
        function atwDate(date) {
            return date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear();
        }
        function skipWeekend(date) {
            if ((date.getDay() === 6 || date.getDay() === 0) && !elements.weekend.checked) {
                // skip over Saturday & Sunday
                date.setDate(date.getDate() + (date.getDay() === 6 ? 2 : 1));
            }
        }
        if (!elements.claimPeriod.monthly.checked) {
            // claim period is weekly, don't render anything
            return;
        }
        var subListNum = 1;
        function createSubList(list) {
            var subList = elements.templates.subList.cloneNode(true);
            subList.classList.remove('claim-form__sublist--is-hidden');
            subList.querySelector('[data-claim-form-sublist-heading]').innerText = 'Week ' + subListNum;
            subListNum++;
            list.appendChild(subList);
            return subList;
        }
        while (elements.claimList.lastChild) {
            elements.claimList.removeChild(elements.claimList.lastChild);
        }
        var subList = createSubList(elements.claimList);
        var detailTemplate = travel ? elements.templates.journeyCost : elements.templates.hoursCosts;
        var currentDate = new Date(month);
        currentDate.setDate(1);
        skipWeekend(currentDate);
        // pad first week down to align with next 3 or 4 week columns
        var j = [6, 0, 1, 2, 3, 4, 5][currentDate.getDay()];
        for (; j > 0; j--) {
            var clone = detailTemplate.cloneNode(true);
            clone.querySelector('[data-claim-form-detail-date]').innerText = 'x';
            clone.classList.remove('claim-form__claim-week-detail--is-hidden');
            clone.classList.add('claim-form__claim-week-detail--is-invisible');
            subList.appendChild(clone);
        }
        for (var i = 0; currentDate.getMonth() === month.getMonth(); i++) {
            var clone = detailTemplate.cloneNode(true);
            clone.querySelector('[data-claim-form-detail-date]').innerText = formatDate(currentDate);
            if (!travel) {
                // support worker... so hours & cost
                clone.querySelector('[data-claim-form-detail-hours-label]').setAttribute('for', 'detail-hours-' + i);
                clone.querySelector('[data-claim-form-detail-hours-input]').id = 'detail-hours-' + i;
                clone.querySelector('[data-claim-form-detail-hours-input]').name = 'detail-hours-' + atwDate(currentDate);
                clone.querySelector('[data-claim-form-detail-costs-label]').setAttribute('for', 'detail-costs-' + i);
                clone.querySelector('[data-claim-form-detail-costs-input]').id = 'detail-costs-' + i;
                clone.querySelector('[data-claim-form-detail-costs-input]').name = 'detail-costs-' + atwDate(currentDate);
            } else {
                // travel... so cost
                clone.querySelector('[data-claim-form-detail-am-label]').setAttribute('for', 'detail-am-' + i);
                clone.querySelector('[data-claim-form-detail-am-input]').id = 'detail-am-' + i;
                clone.querySelector('[data-claim-form-detail-am-input]').name = 'detail-am-' + atwDate(currentDate);
                clone.querySelector('[data-claim-form-detail-pm-label]').setAttribute('for', 'detail-pm-' + i);
                clone.querySelector('[data-claim-form-detail-pm-input]').id = 'detail-pm-' + i;
                clone.querySelector('[data-claim-form-detail-pm-input]').name = 'detail-pm-' + atwDate(currentDate);
            }
            clone.classList.remove('claim-form__claim-week-detail--is-hidden');
            subList.appendChild(clone);
            currentDate.setDate(currentDate.getDate() + 1);
            skipWeekend(currentDate);
            if (currentDate.getDay() === 1 && currentDate.getMonth() === month.getMonth()) {
                subList = createSubList(elements.claimList);
            }
        }
    }
    function setupListeners() {
        // show month selection if monthly is selected as claim period
        elements.claimPeriod.monthly.addEventListener('change', function () {
            createView(monthSelection.selected, elements.weekend.checked, elements.claimType.travel.checked);
        });
        // update view when Saturday/Sunday option changes
        elements.weekend.addEventListener('change', function() {
            createView(monthSelection.selected, elements.weekend.checked, elements.claimType.travel.checked);
        });
        // update view when a month is selected
        monthSelection.listeners.push(function () {
            createView(monthSelection.selected, elements.weekend.checked, elements.claimType.travel.checked);
        });
        // update view when claim form type changes (support vs support worker)
        elements.claimType.support.addEventListener('change', function () {
            createView(monthSelection.selected, elements.weekend.checked, elements.claimType.travel.checked);
        });
        elements.claimType.travel.addEventListener('change', function () {
            createView(monthSelection.selected, elements.weekend.checked, elements.claimType.travel.checked);
        });
    }
    setupListeners();
}
new MonthDetails();

