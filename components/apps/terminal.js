import React, { Component } from 'react'
import $, { event } from 'jquery';
import ReactGA from 'react-ga4';
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: "",
    dangerouslyAllowBrowser: true
  });

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
            fileName: 'No file selected'
        }
    }


    handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // this.setState({ 
            //     image: URL.createObjectURL(file),
            //     fileName: file.name
            // });

            // 转换base64
            const render = new FileReader()
            render.onload = () => {
                this.setState({ 
                    image: render.result,
                    fileName: file.name
                });

                console.log(render.result)
            }

            render.readAsDataURL(file)
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
                        <div className=" text-ubt-green">HKU @ way2way</div>
                        <div className=" text-ubt-blue"> &nbsp;Ask me anything about HKU</div>
                        <div className="text-ubt-blue mx-px font-medium">:</div>
                        <div className=" text-ubt-blue">{this.current_directory}</div>
                        <div className="text-ubt-green mx-px font-medium mr-1">$</div>
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
                result = await callOpenAI(command, this.state.image);
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
            <div className="flex flex-col items-center bg-ub-drk-abrgn h-full text-white">
                <div className=" w-full bg-ub-drk-abrgn text-white text-sm font-bold" id="terminal-body">
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
                            <div style={{ height: '20px', backgroundColor: 'transparent' }}></div>
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


async function callOpenAI(message, image) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
            role: "system",
            content: `As an AI navigation assistant for the University of Hong Kong (HKU), you are deeply familiar with the campus layout. All your responses regarding location recognition and navigation must be 100% relevant to HKU. You will use the following HKU-specific location tags to guide your responses:

                [ "james_hsioung_lee_science_building", "hui_oi_chow_science_building", "run_run_shaw_building", "rayson_huang_theatre", "runme_shaw_building", "meng_wah_complex", "eliot_hall", "chong_yuet_ming_physics_building", "chong_yuet_ming_chemistry_building", "chong_yuet_ming_amenities_centre", "tam_wing_fan_innovation_wing", "k_k_leung_building", "knowles_building", "sun_yat_sen_place", "main_building", "loke_yew_hall", "kadorie_biological_science_building", "main_library", "chong_yuet_ming_physics_building", "tt_tsui_building", "swire_building", "hui_pun_hing_lecture_hall", "composite_building", "chou_yei_ching_building", "chi_wah_learning_commons", "run_run_shaw_tower", "the_jockey_club_tower", "cheng_yu_tung_tower", "central_podium" ]

            Interaction Scenarios:

            (1) User Asks for Current Location Without an Image:
            If the user asks where they are but hasn't uploaded an image, you should politely ask them to upload a picture first. You may engage in casual conversation on other topics, but if they ask for their current location without an image, you must request an image.

            (2) User Asks for Current Location with an Uploaded Image:
            If the user uploads an image and asks where they are, analyze the image to see if it matches one of the listed HKU location tags. If it does, inform them of their current location. If the image doesn't match any of the tags, let them know you're unable to determine their exact location on campus.

            (3) User Asks for Directions with an Uploaded Image:
            If the user uploads an image and asks for directions to a specific location (that's on the list of HKU location tags), use the "test_route.json" file to provide precise, step-by-step directions.
            If the destination is not on the list, inform the user that this location may not be within HKU.
            If both the starting location and destination are listed but don't have an exact route in "test_route.json", make a logical estimation based on available routes in the file to guide the user.

            (4) User Asks other things which are not related to directions and locations with an Uploaded Image:
            Just chat with them like a human.

            test_route.json:
            [
                {"starting point": "main_building", "endpoint": "knowles_building", "route": "Exit the Main Building, follow the path north past the Sun Yat-sen Place, and continue straight to Knowles Building."},
                {"starting point": "knowles_building", "endpoint": "main_building", "route": "Head south from Knowles Building, pass the Sun Yat-sen Place, and arrive at the Main Building."},
                {"starting point": "tam_wing_fan_innovation_wing", "endpoint": "eliot_hall", "route": "From Tam Wing Fan Innovation Wing, walk west across the open plaza. Go by Runme Shaw Building. Then enter Chong Yuet Ming Cultural Centre, and  take the escalator to the fifth floor. Turn right(west) to Eliot Hall."},
                {"starting point": "eliot_hall", "endpoint": "tam_wing_fan_innovation_wing", "route": "From Eliot Hall, head east to enter Chong Yuet Ming Cultural Centre. Go downstairs to the 3/F. Leave the building and walk across the open plaza until you reach Tam Wing Fan Innovation Wing."},
                {"starting point": "swire_building", "endpoint": "main_library", "route": "Exit Swire Building, head east down the hill to K.K. Leung Building. Enter the building and take the lift to G/F, walk east out of the building. Head east straight forward to Main Library."},
                {"starting point": "main_library", "endpoint": "swire_building", "route": "From the Main Library, follow the path west to the Sun Yat-sen Place. Then face the Knowles Building, follow the path to its left(south) to the K.K. Leung Building. Enter the building and take the lift to LG2. Head south to leave the building. Turn right  to arrive at Swire Building."},
                {"starting point": "k_k_leung_building", "endpoint": "hui_oi_chow_science_building", "route": "Walk south from KK Leung Building to Sun Yat-sen Place. Head north, facing the long staircase. Climb the stairs to the top and turn right(east) to Hui Oi Chow Science Building."},
                {"starting point": "hui_oi_chow_science_building", "endpoint": "k_k_leung_building", "route": "Exit Hui Oi Chow Science Building, head west to the long staircase. Head south to walk down the stairs to Sun Yat-sen Place. Pass Knowles Building, follow the path to its left(south) to the K.K. Leung Building. "},
                {"starting point": "tt_tsui_building", "endpoint": "rayson_huang_theatre", "route": "Leave TT Tsui Building, head north to K.K. Leung Building. Enter the building and take the lift to G/F, walk east out of the building to Sun Yat-sen Place. Head north, facing up to the long staircase. Climb the stairs to the top. Face  Run Run Shaw Building. Rayson Huang Theatre is on its left."},
                {"starting point": "rayson_huang_theatre", "endpoint": "tt_tsui_building", "route": "Exit Rayson Huang Theatre, head east to the long staircase. Head south to walk down the stairs to Sun Yat-sen Place. Pass Knowles Building, follow the path to its left(south) to the K.K. Leung Building. Enter the building and take the lift to LG2. Head south to leave the building. Head south to reach TT Tsui Building."},
                {"starting point": "sun_yat_sen_place", "endpoint": "hui_pun_hing_lecture_hall", "route": "From Sun Yat-sen Place, Head south and take the stairs in the middle to one floor below. Turn left(east) to Hui Pun Hing Lecture Hall."},
                {"starting point": "hui_pun_hing_lecture_hall", "endpoint": "sun_yat_sen_place", "route": "Leave Hui Pun Hing Lecture Hall, turn right(west) to the stairs to one floor above to reach Sun Yat-sen Place."},
                {"starting point": "runme_shaw_building", "endpoint": "run_run_shaw_building", "route": "Exit Runme Shaw Building, turn left(east), walk straight forward to Run Run Shaw Building."},
                {"starting point": "run_run_shaw_building", "endpoint": "runme_shaw_building", "route": "From Run Run Shaw Building, walk west across the courtyard to arrive at Runme Shaw Building."},
                {"starting point": "james_hsioung_lee_science_building", "endpoint": "kadorie_biological_science_building", "route": "From James Hsioung Lee Science Building, walk south,passing Haking Wong Building to reach Kadorie Biological Science Building."}, 
                {"starting point": "kadorie_biological_science_building", "endpoint": "james_hsioung_lee_science_building", "route": "Head north from Kadorie Biological Science Building, cross the Haking Wong Building, then turn left and go straight to reach James Hsioung Lee Science Building."},
                {"starting point": "meng_wah_complex", "endpoint": "hui_oi_chow_science_building", "route": "From Meng Wah Complex, walk west, cross Runme Shaw Building and Run Run Shaw Building, turn right, over a slope, cross the Run Run Shaw Building, then turn left and go straight about 50 meters, turn right again and go up the overpass, after about 80 meters reach Hui Oi Chow Science Building."},
                {"starting point": "hui_oi_chow_science_building", "endpoint": "meng_wah_complex", "route": "Exit Hui Oi Chow Science Building, head south and go up the overpass, after about 80 meters, then turn left and go straight about 50 meters, then turn right, over a slope, turn left agian, after about 200 meters arrive at Meng Wah Complex."},
                {"star ting point": "kadorie_biological_science_building", "endpoint": "chong_yuet_ming_amenities_centre", "route": "From Kadorie Biological Science Building, head south and go straight about 70 meters, then turn left, after about 120 meters and go downstairs, reach Chong Yuet Ming Amenities Centre."},
                {"starting point": "chong_yuet_ming_amenities_centre", "endpoint": "kadorie_biological_science_building", "route": "Head west from Chong Yuet Ming Amenities Centre, go upstairs, then go straight about 120 meters, then turn right, after about 70 meters, arrive at Kadorie Biological Science Building."},
                {"starting point": "tam_wing_fan_innovation_wing", "endpoint": "run_run_shaw_building", "route": "Exit Tam Wing Fan Innovation Wing, walk west across the quad, after about 150 meters, reach Run Run Shaw Building."},
                {"starting point": "run_run_shaw_building", "endpoint": "tam_wing_fan_innovation_wing", "route": "Leave Run Run Shaw Building, head east across the quad, after about 150 meters, reach Tam Wing Fan Innovation Wing."},
                {"starting point": "k_k_leung_building", "endpoint": "swire_building", "route": "From KK Leung Building, head eastnorth through the garden, after about 50 meters arrive at Swire Building."},
                {"starting point": "swire_building", "endpoint": "k_k_leung_building", "route": "Walk westsouth from Swire Building, through the garden, after about 50 meters reach KK Leung Building."},
                {"starting point": "main_building", "endpoint": "eliot_hall", "route": "Exit Main Building, walk east along the path, after about 200 meters turn right, cross Chong Yuet Ming Chemistry Building and arrive at Eliot Hall."},
                {"starting point": "eliot_hall", "endpoint": "main_building", "route": "From Eliot Hall, walk north and cross Chong Yuet Ming Chemistry Building, then turn left, after about 200 meters arrive at the Main Building."},
                {"starting point": "knowles_building", "endpoint": "main_library", "route": "From Knowles Building, walk west, after 70 meters arrive at the Main Library."},
                {"starting point": "main_library", "endpoint": "knowles_building", "route": "Exit Main Library, walk east, after 70 meters arrive at Knowles Building."},
                {"starting point": "chong_yuet_ming_physics_building", "endpoint": "tt_tsui_building", "route": "From Chong Yuet Ming Physics Building, walk east, turn right and go straight, then turn left and after 60 meters enter Standalone Road, after about 150 meters enter Hannington Road and go straight, after about 100 meters, then turn left again and arrive at TT Tsui Building."},
                {"starting point": "tt_tsui_building", "endpoint": "chong_yuet_ming_physics_building", "route": "Leave TT Tsui Building and head east, after 150 meters turn right and go straight, then enter Standalone Road, go straight about 150 meters, then turn right again, after 60 about 60 meters, turn right and go straight, arrive at Chong Yuet Ming Physics Building."},
                {"starting point": "hui_pun_hing_lecture_hall", "endpoint": "runme_shaw_building", "route": "From Hui Pun Hing Lecture Hall, walk south to reach Runme Shaw Building."},
                {"starting point": "runme_shaw_building", "endpoint": "hui_pun_hing_lecture_hall", "route": "Exit Runme Shaw Building and walk north to arrive at Hui Pun Hing Lecture Hall."},
                {"starting point": "chong_yuet_ming_chemistry_building", "endpoint": "james_hsioung_lee_science_building", "route": "Exit from Chong Yuet Ming Chemistry Building 2F, turn right and walk straight to reach James Hsioung Lee Science Building."},
                {"starting point": "james_hsioung_lee_science_building", "endpoint": "chong_yuet_ming_chemistry_building", "route": "Head south from James Hsioung Lee Science Building, turn left and walk straight to reach Chong Yuet Ming Chemistry Building."},
                {"starting point": "main_library", "endpoint": "hui_pun_hing_lecture_hall", "route": "Exit the Main Library from G floor exit. Go upstair and turn right, go straight to arrive at Hui Pun Hing Lecture Hall."},
                {"starting point": "hui_pun_hing_lecture_hall", "endpoint": "main_library", "route": "Leave Hui Pun Hing Lecture Hall, head east and go upstair to reach the Main Library."},
                {"starting point": "tam_wing_fan_innovation_wing", "endpoint": "swire_building", "route": "From Tam Wing Fan Innovation Wing, find the stairs down to the Sun Yat-sen Place. Then face the Knowles Building, follow the path to its left(south) to the K.K. Leung Building. Enter the building and take the lift to LG2. Head south to leave the building. Turn right to arrive at Swire Building."},
                {"starting point": "swire_building", "endpoint": "tam_wing_fan_innovation_wing", "route": "Exit Swire Building, head east down the hill to K.K. Leung Building. Enter the building and take the lift to G/F, walk east out of the building.Head east straight forward to Main Library. Go up the stairs next to the main library and you will see the tam_wing_fan_innovation_wing on the right"},
                {"starting point": "kadorie_biological_science_building", "endpoint": "run_run_shaw_building", "route": "Head south from Kadorie Biological Science Building and enter Run Run Shaw Building."},
                {"starting point": "run_run_shaw_building", "endpoint": "kadorie_biological_science_building", "route": "From Run Run Shaw Building, walk north to reach Kadorie Biological Science Building."},
                {"starting point": "hui_oi_chow_science_building", "endpoint": "rayson_huang_theatre", "route": "Leave Hui Oi Chow Science Building, head west to arrive at Rayson Huang Theatre."},
                {"starting point": "rayson_huang_theatre", "endpoint": "hui_oi_chow_science_building", "route": "Walk east from Rayson Huang Theatre to reach Hui Oi Chow Science Building."},
                {"starting point": "main_building", "endpoint": "knowles_building", "route": "Walk from main building towards knowles building. Follow the main path and turn left when you reach the first intersection. Continue straight ahead and you will find your destination."},
                {"starting point": "main_building", "endpoint": "sun_yat_sen_place", "route": "Walk from main building towards sun yat sen place. Follow the main path and turn left when you reach the first intersection. Continue straight ahead and you will find your destination."},
                {"starting point": "kadorie_biological_science_building", "endpoint": "swire_building", "route": "Walk from kadorie biological science building towards swire building. Follow the main path and turn left when you reach the first intersection. Continue straight ahead and you will find your destination."},
                {"starting point": "k_k_leung_building", "endpoint": "main_building", "route": "Walk from k k leung building towards main building. Follow the main path and pass by Knowles Building. Go down the stairs on the right and cross the Y-shaped intersection. You will find the destination on the left."},
                {"starting point": "loke_yew_hall", "endpoint": "main_library", "route": "Walk from loke yew hall towards main library. Follow the main path, walk to Knowles Building on the east side but don't pass by. Go down the stairs on the left and cross the Y-shaped intersection. You will find the destination on the left."},
                {"starting point": "main_building", "endpoint": "kadorie_biological_science_building", "route": "Walk from main building towards kadorie biological science building. Follow the main path and go to the south-western corner of the main building. Cross the road and you will find your destination."},
                {"starting point": "sun_yat_sen_place", "endpoint": "k_k_leung_building", "route": "Walk from sun yat sen place towards k k leung building. Follow the main path and go north to the library. Turn right and pass by the Knowles Building. Go straight forward and you will find your destination."},
                {"starting point": "main_library", "endpoint": "run_run_shaw_building", "route": "Walk from main library towards run run shaw building. Follow the main path and turn left when you reach Hui Oi Chow Science Building. Continue straight ahead and you will find your destination on your right."},
                {"starting point": "chong_yuet_ming_chemistry_building", "endpoint": "tam_wing_fan_innovation_wing", "route": "Walk from chong yuet ming chemistry building towards tam wing fan innovation wing. Follow the main path and pass by Chong Yuet Ming physics building. Turn left and pass by Chong Yuet Ming  Cultural Centre. Turn right when you reach Ming Wah Complex. Continue straight ahead and turn right when you reach Run Run Shaw Building. Walk forward and you will see your destination."},
                {"starting point": "tam_wing_fan_innovation_wing", "endpoint": "sun_yat_sen_place", "route": "Walk from tam wing fan innovation wing towards sun yat sen place. Take the escalator next to Tam Wing Fan Innovation Wing and turn left when you reach the first intersection. Continue straight ahead and you will find your destination."},
                {"starting point": "main_library", "endpoint": "chong_yuet_ming_chemistry_building", "route": "Walk from main library towards chong yuet ming chemistry building. Go to east and take the stairs on your left. Keep right and go straight. Pass by Swire Hall and turn right. You will see your destination on your right"},
                {"starting point": "chong_yuet_ming_amenities_centre", "endpoint": "tt_tsui_building", "route": "Walk from chong yuet ming amenities centre towards tt tsui building. Follow the main path and go throuugh the Knowles Building. Go down the stairs and turn right. Continue straight ahead and you will find your destination."},
                {"starting point": "sun_yat_sen_place", "endpoint": "chong_yuet_ming_amenities_centre", "route": "Walk from sun yat sen place towards chong yuet ming amenities centre. Follow the main path and go north to the main library. Turn right and pass by the Knowles Building. Go through KK Leung Building and turn right. Go straight and you will see your destination. "}, 
                {"starting point": "k_k_leung_building", "endpoint": "chong_yuet_ming_physics_building", "route": "Walk from k k leung building towards chong yuet ming physics building. Go to Chong Yuet Ming Amenities Centre in the south. Go east through the building and Continue straight ahead and you will find your destination."},
                {"starting point": "hui_pun_hing_lecture_hall", "endpoint": "k_k_leung_building", "route": "Walk from hui pun hing lecture hall towards k k leung building. Follow the main path and pass by the Knowles Building. Continue straight ahead and you will find your destination in the main library."},
                {"starting point": "hui_oi_chow_science_building", "endpoint": "chong_yuet_ming_physics_building", "route": "Walk from hui oi chow science building towards chong yuet ming physics building. Turn right and Go to the southern side of Ming Wah Complex. Go ahead and turn left through Chong Yuet Ming Amenities Centre. Continue straight ahead and you will find your destination."},
                {"starting point": "run_run_shaw_building", "endpoint": "eliot_hall", "route": "Walk from run run shaw building towards eliot hall. Follow the main path and go east ahead. Go through Chong Yuet Ming Amenities Centre and go up the stairs. you will find your destination on your right."},
                {"starting point": "knowles_building", "endpoint": "hui_oi_chow_science_building", "route": "Walk from knowles building towards hui oi chow science building. Walk along the Sun Yat-sen Place. turn right and take the escalator. Turn left and you will find the destination."},
                {"starting point": "hui_pun_hing_lecture_hall", "endpoint": "loke_yew_hall", "route": "Facing the main library, then turn back, go across the bridge between main library and the main building, and turn left, go straight and then turn right, it's like circling around half of the main building, then when you reach the main gate of main building, you can see the loke yew hall right in front of you."},
                {"starting point": "eliot_hall", "endpoint": "james_hsioung_lee_science_building", "route": "When you are facing the Eliot Hall, turn back and go downstairs to the chong yuet ming cultural center, go inside the chong yuet ming cultural center, take the escalator, to the ground floor, then you will face two entrances, choose the left one and go outside, follow the corridor, go straight to the end, then the james hsioung lee science building will be in front of you."},
                {"starting point": "james_hsioung_lee_science_building", "endpoint": "hui_oi_chow_science_building", "route": "First face the james hsioung lee science building, then turn right, the hui oi chow science building will be in front of you."},
                {"starting point": "main_building", "endpoint": "chong_yuet_ming_chemistry_building", "route": "Go inside the main building, cycle around half of the main building, and then there are two elevators in the back side of main building, take one of them to the 2nd floor, go across the bridge between main building and main library, then go upstairs. Go across the Sun Yat-sen Place, then go upstairs to Rayson Huang Theatre, turn left then go straight to Chong Yuet Ming Cultural Centre, follow the escalator to 2nd floor, then go out to the platform. Then go straight you will see the chong yuet ming chemistry building."},
                {"starting point": "kadorie_biological_science_building", "endpoint": "run_run_shaw_building", "route": "Take the elevator to the ground floor, then go upstairs to the 2nd floor, you will see the Sun Yat-sen Place, then go upstairs to the corridor, right in front of you will be the run run shaw building."}
            ]

            
            IMPORTANT GUIDELINES:
            Do not suggest public transport, general maps, or give vague advice. Your responses must be precise and relevant to the HKU campus context only. Every time your response has to mention a label, you should answer the way human like, for example, response "main library" instead of [main_library].
            `
        },
        {
          role: "user",
          content: [
            { type: "text", text: message},
            image && {
              type: "image_url",
              image_url: {
                "url": image,
              },
            },
          ].filter(Boolean),
        },
      ]
    });
    console.log(response.choices[0].message.content);

    return response.choices[0].message.content
}