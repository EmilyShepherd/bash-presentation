(function()
{
    'use strict';

    var deleteLetters = function(el, letters, cb)
    {
        var run = function()
        {
            if (letters-- > 0)
            {
                el.innerText = el.innerText.substr(0, el.innerText.length - 1);
                window.setTimeout(run, 20);
            }
            else if (typeof cb === 'function')
            {
                cb();
            }
        };

        run();
    };

    var typeLetters = function(el, letters, cb)
    {
        var run = function()
        {
            if (letters.length !== 0)
            {
                el.innerText += letters.substr(0, 1);
                letters = letters.substr(1);
                window.setTimeout(run, 20);
            }
            else if (typeof cb === 'function')
            {
                cb();
            }
        };

        run();
    };

    var Slide = function(state, actions, setup)
    {
        var _self = this;
        this.steps = actions;

        if (typeof setup === "function")
        {
            this.setup = setup;
        }
        else
        {
            this.step = null;
        }

        Reveal.addEventListener(state, (function()
        {
            _self.init();
        }), false);
    };

    Slide.prototype.init = (function()
    {
        this.step = 0;
        var _self = this;

        if (typeof this.setup === "function")
        {
            this.setup();
        }

        Reveal.configure
        ({
            keyboard:
            {
                32: (function()
                {
                    _self.runStep();
                })
            }
        });
    });

    Slide.prototype.runStep = (function()
    {
        var step = this.steps[this.step++];

        switch (typeof step)
        {
            case "function":
                step.call(this);
                break
            default:
                this.master.commit(step);
        }

        if (this.step === this.steps.length)
        {
            Reveal.configure({keyboard: {}});
        }
    });

    (function()
    {
        var cmd = document.getElementById('cmd');
        var cmdline = document.getElementById('cmdline');

        var typeCmd = function(command, output, cb)
        {
            typeLetters(cmdline, command + "\n", function()
            {
                if (output)
                {
                    var span = document.createElement('span');
                    span.style.color = 'green';
                    cmd.appendChild(span);
                    span.innerText = output + "\n";
                }

                span = document.createTextNode('/project> ');
                cmd.appendChild(span);

                cmdline = document.createElement('span');
                cmd.appendChild(cmdline);

                document.getElementById('cmd_holder').scrollTop = 9999999;

                if (typeof cb === 'function')
                {
                    cb();
                }
            });
        };
    })();

    Reveal.initialize
    ({
        controls: false,
        progress: true,
        history: true,
        center: true,
        transition: 'slide',

        width: "100%",
        height: "100%"
    });
})();

