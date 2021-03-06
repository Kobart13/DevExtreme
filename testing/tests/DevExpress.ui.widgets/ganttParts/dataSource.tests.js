import $ from 'jquery';
import 'ui/gantt';
import { options, data, getGanttViewCore } from '../../../helpers/ganttHelpers.js';
const { test } = QUnit;

const moduleConfig = {
    beforeEach: function() {
        this.createInstance = (settings) => {
            this.instance = this.$element.dxGantt(settings).dxGantt('instance');
        };

        this.$element = $('#gantt');
        this.clock = sinon.useFakeTimers();
    },
    afterEach: function() {
        this.clock.restore();
    }
};

QUnit.module('DataSources', moduleConfig, () => {
    test('inserting', function(assert) {
        this.createInstance(options.allSourcesOptions);
        this.instance.option('editing.enabled', true);
        this.clock.tick();

        const tasksCount = data.tasks.length;
        const taskData = {
            start: new Date('2019-02-21'),
            end: new Date('2019-02-22'),
            title: 'New',
            progress: 0,
            parentId: '1'
        };
        getGanttViewCore(this.instance).commandManager.createTaskCommand.execute(taskData);
        this.clock.tick();
        assert.equal(data.tasks.length, tasksCount + 1, 'new task was created in ds');
        const createdTask = data.tasks[data.tasks.length - 1];
        assert.equal(createdTask.title, taskData.title, 'new task title is right');
        assert.equal(createdTask.start, taskData.start, 'new task start is right');
        assert.equal(createdTask.end, taskData.end, 'new task end is right');
    });
    test('updating', function(assert) {
        this.createInstance(options.allSourcesOptions);
        this.instance.option('editing.enabled', true);
        this.clock.tick();

        const updatedTaskId = 3;
        const updatedStart = new Date('2019-02-21');
        const updatedEnd = new Date('2019-02-22');
        const updatedTitle = 'New';
        getGanttViewCore(this.instance).commandManager.changeTaskTitleCommand.execute(updatedTaskId.toString(), updatedTitle);
        getGanttViewCore(this.instance).commandManager.changeTaskStartCommand.execute(updatedTaskId.toString(), updatedStart);
        getGanttViewCore(this.instance).commandManager.changeTaskEndCommand.execute(updatedTaskId.toString(), updatedEnd);
        this.clock.tick();
        const updatedTask = data.tasks.filter((t) => t.id === updatedTaskId)[0];
        assert.equal(updatedTask.title, updatedTitle, 'task title is updated');
        assert.equal(updatedTask.start, updatedStart, 'new task start is updated');
        assert.equal(updatedTask.end, updatedEnd, 'new task end is updated');
    });
    test('removing', function(assert) {
        this.createInstance(options.allSourcesOptions);
        this.instance.option('editing.enabled', true);
        this.instance.option('selectedRowKey', 3);
        this.clock.tick();

        const removedTaskId = 3;
        const tasksCount = data.tasks.length;
        getGanttViewCore(this.instance).commandManager.removeTaskCommand.execute(removedTaskId.toString(), false);
        this.clock.tick();
        assert.equal(data.tasks.length, tasksCount - 1, 'tasks less');
        const removedTask = data.tasks.filter((t) => t.id === removedTaskId)[0];
        assert.equal(removedTask, undefined, 'task was removed');
    });
    test('delayed loading', function(assert) {
        this.createInstance({
            tasks: { dataSource: [] },
            validation: { autoUpdateParentTasks: true }
        });
        this.clock.tick();

        this.instance.option('tasks.dataSource', data.tasks);
        this.clock.tick();
        assert.equal(this.instance._treeList.option('expandedRowKeys').length, 2, 'each task is loaded and expanded');
    });
    test('incorrect tasks data', function(assert) {
        const failTasks = [
            { 'id': 1, 'title': 'Software Development', 'start': new Date('2019-02-21T05:00:00.000Z'), 'end': new Date('2019-07-04T12:00:00.000Z'), 'progress': 31, 'color': 'red' },
            { 'id': 2, 'parentId': 1, 'title': 'Scope', 'start': new Date('2019-02-21T05:00:00.000Z'), 'end': new Date('2019-02-26T09:00:00.000Z'), 'progress': 60 },
            { 'id': 3, 'parentId': 2, 'title': 'Determine project scope', 'start': new Date('2019-02-21T05:00:00.000Z'), 'end': new Date('2019-02-21T09:00:00.000Z'), 'progress': 100 },
            { 'id': 4, 'parentId': 200, 'title': 'Secure project sponsorship', 'start': new Date('2019-02-21T10:00:00.000Z'), 'end': new Date('2019-02-22T09:00:00.000Z'), 'progress': 100 },
            { 'id': 5, 'parentId': 4, 'title': 'Define preliminary resources', 'start': new Date('2019-02-22T10:00:00.000Z'), 'end': new Date('2019-02-25T09:00:00.000Z'), 'progress': 60 }
        ];
        this.createInstance({
            tasks: { dataSource: failTasks },
            validation: { autoUpdateParentTasks: true }
        });
        this.clock.tick();
        let keys = this.instance.getVisibleTaskKeys();
        assert.equal(keys.length, 3, 'incorrect keys filtered');
        assert.equal(keys[0], 1, 'correct key');
        assert.equal(keys[1], 2, 'correct key');
        assert.equal(keys[2], 3, 'correct key');

        this.instance.option('validation.autoUpdateParentTasks', false);
        this.clock.tick();
        keys = this.instance.getVisibleTaskKeys();
        assert.equal(keys.length, 3, 'incorrect keys filtered');
        assert.equal(keys[0], 1, 'correct key');
        assert.equal(keys[1], 2, 'correct key');
        assert.equal(keys[2], 3, 'correct key');
    });
});
