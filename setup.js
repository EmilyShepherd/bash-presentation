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

    window.Slide = function(number, actions, setup)
    {
        var _self = this;
        this.steps = actions;
        this.pwd = '/project';
        this.cmd = document.getElementById('cmd' + number);
        this.cmdline = document.getElementById('cmdline' + number);
        this.cmdHolder = document.getElementById('cmd_holder' + number);

        if (typeof setup === "function")
        {
            this.setup = setup;
        }
        else
        {
            this.step = null;
        }

        Reveal.addEventListener('cmd' + number, (function()
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
        if (this.queuedStep)
        {
            this.queuedStep();
            this.queuedStep = null;
        }
        else
        {
            var step = this.steps[this.step++];

            switch (typeof step)
            {
                case "function":
                    step.call(this);
                    break
                default:
                    this.typeCmd(step.cmd);

                    this.queuedStep = function()
                    {
                        if (step.pwd)
                        {
                            this.pwd = step.pwd;
                        }
                        this.displayOutput(step.output, step.err)
                    };
            }
        }

        if (this.step === this.steps.length && !this.queuedStep)
        {
            Reveal.configure({keyboard: {}});
        }
    });

    Slide.prototype.typeCmd = function(commandArg)
    {
        var _self = this;
        var command = typeof commandArg === 'object'
            ? commandArg[0]
            : commandArg;

        typeLetters(this.cmdline, command + "\n", function()
        {
            _self.cmdHolder.scrollTop = 9999999;

            if (typeof commandArg === 'object' && commandArg.length > 1)
            {
                _self.typeCmd(commandArg.splice(1));
            }
        });
    }

    Slide.prototype.displayOutput = function(output, err)
    {
        if (err)
        {
            var span = document.createElement('span');
            span.style.color = 'red';
            this.cmd.appendChild(span);
            span.innerHTML = err + "\n";
        }

        if (output)
        {
            var span = document.createElement('span');
            span.style.color = 'green';
            this.cmd.appendChild(span);
            span.innerHTML = output + "\n";
        }

        span = document.createTextNode(this.pwd + '> ');
        this.cmd.appendChild(span);

        this.cmdline = document.createElement('span');
        this.cmd.appendChild(this.cmdline);

        this.cmdHolder.scrollTop = 9999999;

        this.queuedOutput = null;
    };

    window._slide = new Slide('1',
    [
        {
            cmd: 'ls',
            output: 'myFile.html&nbsp;&nbsp;&nbsp;myOtherFile.xml'
            + '&nbsp;&nbsp;&nbsp;myFolder'
        },
        {
            cmd: 'ls -a',
            output: 'myFile.html&nbsp;&nbsp;&nbsp;myOtherFile.xml'
            + '&nbsp;&nbsp;&nbsp;myFolder&nbsp;&nbsp;&nbsp;.svn'
            + '&nbsp;&nbsp;&nbsp;.git'
        },
        {
            cmd: 'ls -l',
            output:
                  '-rw-r--r-- emily emily 8597 Nov 16 10:24 myFile.html'
                + '<br />'
                + '-rw-r--r-- emily emily 8593 Nov 14 11:32 myOtherFile.xml'
                + '<br />'
                + 'drwxr-xr-x emily emily 4096 Mar 19 12:41 myFolder'
        },
        {
            cmd: 'ls -lh',
            output:
                  '-rw-r--r-- emily emily 4.0K Nov 16 10:24 myFile.html'
                + '<br />'
                + '-rw-r--r-- emily emily 8.4K Nov 14 11:32 myOtherFile.xml'
                + '<br />'
                + 'drwxr-xr-x emily emily 8.4K Mar 19 12:41 myFolder'
        },
        {
            cmd: 'cd myFolder',
            pwd: 'myFolder'
        },
        {
            cmd: 'ls',
            output: 'someOtherFile.txt&nbsp;&nbsp;&nbsp;file.txt'
        },
        {
            cmd: 'echo this is something to output',
            output: 'this is something to output'
        },
        {
            cmd: 'myVariable="some value"'
        },
        {
            cmd: 'echo $myVariable',
            output: 'some value'
        },
        {
            cmd: 'echo This is $myVariable',
            output: 'This is some value'
        }
    ]);

    var slide2 = new Slide('2',
    [
        {
            cmd: 'echo Some Value',
            output: 'Some Value'
        },
        {
            cmd: 'ls this/path/doesnt/exist',
            err: 'ls: cannot access \'this/path/doesnt/exist\': No such file or directory'
        },
        {
            cmd: 'ls',
            output: 'myFile.html&nbsp;&nbsp;&nbsp;myOtherFile.xml'
            + '&nbsp;&nbsp;&nbsp;myFolder'
        },
        {
            cmd: 'cat myFile.html',
            output: 'This is an HTML file with lot of content.<br />'
                + '<br />'
                + 'In theory this file should have some actual HTML '
                + 'tags in<br />'
                + 'it, but emily was too lazy to write any into her<br />'
                + 'presentation. You just can\'t get the staff these days.'
        }
    ]);

    var slide3 = new Slide('3',
    [
        {
            cmd: 'echo Put this in my file > newFile.txt'
        },
        {
            cmd: 'ls',
            output: 'myFile.html&nbsp;&nbsp;&nbsp;myOtherFile.xml'
            + '&nbsp;&nbsp;&nbsp;newFile.txt&nbsp;&nbsp;&nbsp;myFolder'
        },
        {
            cmd: 'cat myFile.txt',
            output: 'Put this in my file'
        },
        {
            cmd: 'echo Now put this in there > newFile.txt'
        },
        {
            cmd: 'cat myFile.txt',
            output: 'Now put this in there'
        },
        {
            cmd: 'echo Add this to the end >> newFile.txt',
            output: 'Now put this in there<br />'
                + 'Add this to the end'
        },
        {
            cmd: 'echo i have 3 kittens | tr "3" "4"',
            output: 'i have 4 kittens'
        },
        {
            cmd: 'echo i have 3 kittens | tr "3" "4" | tr "i" "I"',
            output: 'I have 4 kittens'
        },
        {
            cmd: 'echo i have 3 kittens | tr "3" "4" | tr "i" "I" >> newFile.txt'
        },
        {
            cmd: 'cat newFile.txt',
            output: 'Now put this in there<br />'
                + 'Add this to the end<br />'
                + 'I have 4 kittens'
        },
        {
            cmd: 'myVariable="some value"'
        },
        {
            cmd: 'myVariable=$(cat myFile.txt)'
        },
        {
            cmd: 'echo $myVariable',
            output: 'Now put this in there<br />'
                + 'Add this to the end<br />'
                + 'I have 4 kittens'
        },
        {
            cmd: 'myVariable=$(cat myFile.txt | tr "4" "9")'
        },
        {
            cmd: 'echo $myVariable',
            output: 'Now put this in there<br />'
                + 'Add this to the end<br />'
                + 'I have 9 kittens'
        }
    ]);

    var slide4 = new Slide('4',
    [
        {
            cmd: 'cat myFolder/myFile.html',
            output: 'This is an HTML file with lot of content.<br />'
                + '<br />'
                + 'In theory this file should have some actual HTML '
                + 'tags in<br />'
                + 'it, but emily was too lazy to write any into her<br />'
                + 'presentation. You just can\'t get the staff these days.'
        },
        {
            cmd: 'grep HTML myFolder/myFile.html',
            output: 'This is an HTML file with lot of content.<br />'
                + 'In theory this file should have some actual HTML '
                + 'tags in'
        },
        {
            cmd: 'grep XML myFolder/myFile.html'
        },
        {
            cmd:
            [
                "\\",
                "> if grep -q HTML myFolder/myFile.html",
                "> then",
                "> echo Success!",
                "> fi"
            ],
            output: 'Success'
        },
        {
            cmd:
            [
                "\\",
                "> if grep -q XML myFolder/myFile.html",
                "> then",
                "> echo Success!",
                "> fi"
            ]
        },
        {
            cmd: 'myVariable=cat'
        },
        {
            cmd:
            [
                "\\",
                "> if test $myVariable == cat",
                "> then",
                "> echo Success!",
                "> fi"
            ],
            output: 'Success'
        },
        {
            cmd: "\\\n> if test $myVariable -eq 438\n"
                + "> then\n> echo Success!\n> fi"
        },
        {
            cmd: "\\\n> if test $myVariable -lt 438\n"
                + "> then\n> echo Success!\n> fi"
        },
        {
            cmd: "\\\n> if [[ $myVariable == cat ]]\n"
                + "> then\n> echo Success!\n> fi",
            output: 'Success'
        }
    ]);

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

