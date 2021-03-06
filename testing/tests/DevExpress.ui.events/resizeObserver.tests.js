import $ from 'jquery';
import ResizeObserver from 'ui/overlay/resize_observer';
import { getWindow, setWindow } from 'core/utils/window';
const window = getWindow();

const TIME_TO_WAIT = 25;

QUnit.testStart(function() {
    const markup = '<div id="root" style="width: 200px;"></div>';

    $('#qunit-fixture').html(markup);
});

QUnit.module('Resize observer', () => {
    QUnit.test('initialization should not raise any error if there is no window', function(assert) {
        setWindow(window, false);
        let observer;

        try {
            observer = new ResizeObserver();

            assert.ok(true, 'no errors were raised');
        } catch(e) {
            assert.ok(false, `error: ${e.message}`);
        } finally {
            setWindow(window, true);
            observer.disconnect();
        }
    });

    QUnit.module('shouldSkipCallback', {
        beforeEach: function() {
            this.callback = sinon.stub();
            this.$element = $('#root');
        },
        afterEach: function() {
            this.observer.disconnect();
        }
    }, () => {
        QUnit.testInActiveWindow('should call passed "shouldSkipCallback" function before each callback', function(assert) {
            const observeHandled = assert.async();
            const resizeHandled = assert.async();
            this.shouldSkipCallback = sinon.stub();

            this.observer = new ResizeObserver({ callback: this.callback, shouldSkipCallback: this.shouldSkipCallback });
            this.observer.observe(this.$element.get(0));

            setTimeout(() => {
                this.$element.width(50);
                setTimeout(() => {
                    assert.ok(this.shouldSkipCallback.called);
                    resizeHandled();
                }, TIME_TO_WAIT);
                observeHandled();
            }, TIME_TO_WAIT);
        });

        QUnit.testInActiveWindow('should not call "callback" if "shouldSkipCallback" returns true', function(assert) {
            const observeHandled = assert.async();
            const resizeHandled = assert.async();
            this.shouldSkipCallback = sinon.stub().returns(true);

            this.observer = new ResizeObserver({ callback: this.callback, shouldSkipCallback: this.shouldSkipCallback });
            this.observer.observe(this.$element.get(0));

            setTimeout(() => {
                this.$element.width(50);
                setTimeout(() => {
                    assert.ok(this.callback.notCalled);
                    resizeHandled();
                }, TIME_TO_WAIT);
                observeHandled();
            }, TIME_TO_WAIT);
        });
    });

    QUnit.module('base functionality', {
        beforeEach: function() {
            this.callback = sinon.stub();
            this.observer = new ResizeObserver({ callback: this.callback });
            this.$element = $('#root');
        },
        afterEach: function() {
            this.observer.disconnect();
            this.callback.reset();
        }
    }, () => {
        QUnit.testInActiveWindow('callback should be raised after observable element resize', function(assert) {
            const observeHandled = assert.async();
            const resizeHandled = assert.async();

            this.observer.observe(this.$element.get(0));

            setTimeout(() => {
                this.$element.width(50);
                setTimeout(() => {
                    assert.strictEqual(this.callback.callCount, 2, 'on "observe" call and on target element resize');
                    resizeHandled();
                }, TIME_TO_WAIT);
                observeHandled();
            }, TIME_TO_WAIT);
        });

        QUnit.testInActiveWindow('callback should not be raised on element resize if it was unobserved', function(assert) {
            const observeHandled = assert.async();
            const resizeHandled = assert.async();

            this.observer.observe(this.$element.get(0));

            setTimeout(() => {
                this.observer.unobserve(this.$element.get(0));
                this.$element.width(50);
                setTimeout(() => {
                    assert.ok(this.callback.calledOnce, 'called only on "observe" method invoke');
                    resizeHandled();
                }, TIME_TO_WAIT);
                observeHandled();
            }, TIME_TO_WAIT);
        });

        QUnit.testInActiveWindow('callback should not be raised after "skipNextResize" method call', function(assert) {
            const observeHandled = assert.async();
            const resizeHandled = assert.async();

            this.observer.observe(this.$element.get(0));

            this.observer.skipNextResize();
            setTimeout(() => {
                this.$element.width(50);
                setTimeout(() => {
                    assert.ok(this.callback.calledOnce, 'called only on "observe" method invoke');
                    resizeHandled();
                }, TIME_TO_WAIT);
                observeHandled();
            }, TIME_TO_WAIT);
        });

        QUnit.testInActiveWindow('only one callback should be skipped after "skipNextResize" method call', function(assert) {
            const observeHandled = assert.async();
            const firstResizeHandled = assert.async();
            const secondResizeHandled = assert.async();

            this.observer.observe(this.$element.get(0));

            this.observer.skipNextResize();
            setTimeout(() => {
                this.$element.width(50);
                setTimeout(() => {
                    this.$element.width(100);
                    setTimeout(() => {
                        assert.strictEqual(this.callback.callCount, 2, 'on "observe" call and on second resize');
                        secondResizeHandled();
                    }, TIME_TO_WAIT);
                    firstResizeHandled();
                }, TIME_TO_WAIT);
                observeHandled();
            }, TIME_TO_WAIT);
        });
    });
});
