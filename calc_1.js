import React, { Component } from 'react'
import $, { event } from 'jquery';
import ReactGA from 'react-ga4';

const dotenv = require('dotenv');
const fs = require('fs');
const base64 = require('base64-js');
const axios = require('axios');

dotenv.config();

const locationLabels = JSON.parse(fs.readFileSync('./test_labels.json', 'utf8'));

function encodeImage(imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);
    return base64.fromByteArray(imageBuffer).toString('utf-8');
}

export class Terminal extends Component {
    constructor() {
        super();
        this.cursor = "";
        this.terminal_rows = 1;
        this.current_directory = "~";
        this.prev_commands = [];
        this.commands_index = -1;
        this.child_directories = {};
        this.state = {
            terminal: [],
            image: null,
            fileName: 'No file selected',
            locationLabels: []
        }
    }

    handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            this.setState({ 
                image: URL.createObjectURL(file),
                fileName: file.name
            });
        }
    }

    componentDidMount() {
        this.appendTerminalRow();
    }

    componentDidUpdate() {
        clearInterval(this.cursor);
        this.startCursor(this.terminal_rows - 2);
    }

    componentWillUnmount() {
        clearInterval(this.cursor);
    }

    reStartTerminal = () => {
        clearInterval(this.cursor);
        $('#terminal-body').empty();
        this.appendTerminalRow();
    }

    appendTerminalRow = () => {
        let terminal = this.state.terminal;
        terminal.push(this.terminalRow(this.terminal_rows));
        this.setState({ terminal });
        this.terminal_rows += 2;
    }

    terminalRow = (id) => {
        return (
            <React.Fragment key={id}>
                <div className="flex w-full h-5 bg-ub-drk-abrgn">
                    <div className="flex">
                        <div className=" text-ubt-green">HKU.way2way (7211), input "chat", then start knowing everything about HKU!</div>
                        <div className="text-white mx-px font-medium">:</div>
                        <div className=" text-ubt-blue">{this.current_directory}</div>
                        <div className="text-white mx-px font-medium mr-1">$</div>
                    </div>
                    <div id="cmd" onClick={this.focusCursor} className=" bg-transperent relative flex-1 overflow-hidden">
                        <span id={`show-${id}`} className=" float-left whitespace-pre pb-1 opacity-100 font-normal tracking-wider"></span>
                        <div id={`cursor-${id}`} className=" float-left mt-1 w-1.5 h-3.5 bg-white"></div>
                        <input id={`terminal-input-${id}`} data-row-id={id} onKeyDown={this.checkKey} onBlur={this.unFocusCursor} className=" absolute top-0 left-0 w-full opacity-0 outline-none bg-transparent" spellCheck={false} autoFocus={true} autoComplete="off" type="text" />
                    </div>
                </div>
                <div id={`row-result-${id}`} className={"my-2 font-normal"}></div>
            </React.Fragment>
        );

    }

    focusCursor = (e) => {
        clearInterval(this.cursor);
        this.startCursor($(e.target).data("row-id"));
    }

    unFocusCursor = (e) => {
        this.stopCursor($(e.target).data("row-id"));
    }

    startCursor = (id) => {
        clearInterval(this.cursor);
        $(`input#terminal-input-${id}`).trigger("focus");
        // On input change, set current text in span
        $(`input#terminal-input-${id}`).on("input", function () {
            $(`#cmd span#show-${id}`).text($(this).val());
        });
        this.cursor = window.setInterval(function () {
            if ($(`#cursor-${id}`).css('visibility') === 'visible') {
                $(`#cursor-${id}`).css({ visibility: 'hidden' });
            } else {
                $(`#cursor-${id}`).css({ visibility: 'visible' });
            }
        }, 500);
    }

    stopCursor = (id) => {
        clearInterval(this.cursor);
        $(`#cursor-${id}`).css({ visibility: 'visible' });
    }

    removeCursor = (id) => {
        this.stopCursor(id);
        $(`#cursor-${id}`).css({ display: 'none' });
    }

    clearInput = (id) => {
        $(`input#terminal-input-${id}`).trigger("blur");
    }

    checkKey = (e) => {
        if (e.key === "Enter") {
            let terminal_row_id = $(e.target).data("row-id");
            let command = $(`input#terminal-input-${terminal_row_id}`).val().trim();
            if (command.length !== 0) {
                this.removeCursor(terminal_row_id);
                this.handleCommands(command, terminal_row_id);
            }
            else return;
            // push to history
            this.prev_commands.push(command);
            this.commands_index = this.prev_commands.length - 1;

            this.clearInput(terminal_row_id);
        }
        else if (e.key === "ArrowUp") {
            let prev_command;

            if (this.commands_index <= -1) prev_command = "";
            else prev_command = this.prev_commands[this.commands_index];

            let terminal_row_id = $(e.target).data("row-id");

            $(`input#terminal-input-${terminal_row_id}`).val(prev_command);
            $(`#show-${terminal_row_id}`).text(prev_command);

            this.commands_index--;
        }
        else if (e.key === "ArrowDown") {
            let prev_command;

            if (this.commands_index >= this.prev_commands.length) return;
            if (this.commands_index <= -1) this.commands_index = 0;

            if (this.commands_index === this.prev_commands.length) prev_command = "";
            else prev_command = this.prev_commands[this.commands_index];

            let terminal_row_id = $(e.target).data("row-id");

            $(`input#terminal-input-${terminal_row_id}`).val(prev_command);
            $(`#show-${terminal_row_id}`).text(prev_command);

            this.commands_index++;
        }
    }

    childDirectories = (parent) => {
        let files = [];
        files.push(`<div class="flex justify-start flex-wrap">`)
        this.child_directories[parent].forEach(file => {
            files.push(
                `<span class="font-bold mr-2 text-ubt-blue">'${file}'</span>`
            )
        });
        files.push(`</div>`)
        return files;
    }

    closeTerminal = () => {
        $("#close-terminal").trigger('click');
    }

    handleCommands = async (command, rowId) => {
        let words = command.split(' ').filter(Boolean);
        let main = words[0];
        words.shift()
        let result = "";
        let rest = words.join(" ");
        rest = rest.trim();
        switch (main) {
            default:
                result = await callChatbot(this.state.image, command);
        }
        document.getElementById(`row-result-${rowId}`).innerHTML = result;
        this.appendTerminalRow();
    }

    xss(str) {
        if (!str) return;
        return str.split('').map(char => {
            switch (char) {
                default:
                    return char;
            }
        }).join('');
    }


    render() {
        return (
            <div className="flex flex-col items-center justify-center bg-ub-drk-abrgn text-white">
                <div className="h-full w-full bg-ub-drk-abrgn text-white text-sm font-bold" id="terminal-body">
                    {
                        this.state.terminal
                    }
                </div>
                <div className="flex flex-col items-center justify-center bg-ub-drk-abrgn text-white">
                    <label className="mb-4 p-2 border border-gray-500 rounded cursor-pointer bg-gray-700 hover:bg-gray-600">
                        Choose File
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={this.handleImageUpload} 
                            className="hidden"
                        />
                    </label>
                    <span className="text-sm bg-ub-drk-abrgn">{this.state.fileName}</span>
                    {this.state.image && (
                        <div className="mt-4">
                            <img 
                                src={this.state.image} 
                                alt="Uploaded" 
                                className="max-w-full max-h-96 border bg-ub-drk-abrgn rounded"
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default Terminal

export const displayTerminal = (addFolder, openApp) => {
    return <Terminal addFolder={addFolder} openApp={openApp}> </Terminal>;
}

async function callChatbot(imagePath, userMessage) {
    try {
      // Encode the image
      const base64Image = encodeImage(imagePath);
  
      // Prepare the request body with both the image and the user message
      const requestBody = {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `
              You are an AI image analyst specialized in recognizing university campus locations.
              Given an image, you must identify it as one of the following locations at The University of Hong Kong (HKU):
              ${locationLabels.join(', ')}. If you cannot recognize the location, still provide a response by selecting the most appropriate label from the list, even if you are uncertain. Do not answer with 'Unknown'.
              Please do remember, you should just answer the location name, nothing else.
            `
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userMessage
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ]
      };

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      );
  
      // Get the response from the model
      const content = response.data.choices[0].message.content;
      return content;
  
    } catch (error) {
      console.error('Error calling the API:', error);
      return null;
    }
  }