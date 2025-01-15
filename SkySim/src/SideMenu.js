//ReactJS
import React, {useState} from "react";

//UI
import {Sheet, SheetContent, SheetHeader, SheetTitle} from "./components/ui/sheet";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "./components/ui/table";
import {Popover, PopoverContent, PopoverTrigger} from "./components/ui/popover";
import {Button} from "./components/ui/button";
import {Label} from "./components/ui/label";
import {Input} from "./components/ui/input";
import {ScrollArea} from "./components/ui/scroll-area";
import {Slider} from "./components/ui/slider";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./components/ui/select";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "./components/ui/tooltip";
import {Badge} from "./components/ui/badge";

//Icons
import {Pencil2Icon, PlusCircledIcon, TrashIcon} from "@radix-ui/react-icons";

//Simulation/Rendering
import {SolarSystemSimulator} from "./Simulator/SolarSystemSimulator";
import {Renderer} from "./Rendering/Renderer";

//Utils
import {floatToBaseExp, idToColor, isNumeric, useEventListener} from "./utils/uiUtils";
import {
  cartesianToSpherical,
  cartesianToSphericalVelocity,
  sphericalToCartesian,
  sphericalToCartesianVelocity
} from "./Geometry/GeometryJS";

//Scenarios
import {scenarios} from "./exampleScenarios";
import {useToast} from "./components/ui/use-toast";

//Set global Simulator and Renderer
let simulator = new SolarSystemSimulator(1);
let renderer = new Renderer(null, simulator);

/**
 * Component which represents one Object in the data-table in the SideMenu
 *
 * @param data
 * @param mutateData
 * @returns {Element}
 * @constructor
 */
export function ObjectRepresentator({data, mutateData}) {
  const { toast } = useToast();

  //State which represents if the Popover used to edit an Object's Parameters is opened
  const [popoverOpen, setPopoverOpen] = useState(false);

  //State which represents the Object's Parameters before they get submitted to the SideMenu when the Popover is closed
  //Transform Cartesian Coordinates to Spherical for better usability
  let prepared_data = {
    ...data,
    "massBase": data.mass === 0 ? 0.0 : data.mass / Math.pow(10, Math.floor(Math.log10(data.mass))),
    "massExp": data.mass === 0 ? 0.0 : Math.floor(Math.log10(data.mass)),
    "pos_spherical": cartesianToSpherical(data.pos[0], data.pos[1], data.pos[2]),
    "vel_spherical": cartesianToSphericalVelocity(data.pos, data.vel)
  }

  //Transform from rad/s to rad/yr
  prepared_data["vel_spherical"] = [
    prepared_data["vel_spherical"][0] * 365 * 24 * 60 * 60,
    prepared_data["vel_spherical"][1] * 365 * 24 * 60 * 60,
    prepared_data["vel_spherical"][2] * 365 * 24 * 60 * 60
  ]

  const [tempData, setTempData] = useState(prepared_data);

  /**
   * Checks if the data_to_validate inputted to the Popover (id, mass, pos, vel) is numeric and casts it to Number
   *
   * @param {{}} data_to_validate - Data to validate
   * @returns {{pos: number[], mass: number, name: string, id: number, vel: number[]}, radius: number|boolean}
   */
  function validateData(data_to_validate) {
    if(!isNumeric(data_to_validate.pos_spherical[0]) || !isNumeric(data_to_validate.pos_spherical[1]) || !isNumeric(data_to_validate.pos_spherical[2])) {
      //If Error occurs, set data back to last valid state
      setTempData(prepared_data);
      return false;
    }
    if(!isNumeric(data_to_validate.vel_spherical[0]) || !isNumeric(data_to_validate.vel_spherical[1]) || !isNumeric(data_to_validate.vel_spherical[2])) {
      //If Error occurs, set data back to last valid state
      setTempData(prepared_data);
      return false;
    }
    if(!isNumeric(data_to_validate.mass) || !isNumeric(data_to_validate.massBase) || !isNumeric(data_to_validate.massExp)) {   //Can be simplified but wouldn't fit context
      //If Error occurs, set data back to last valid state
      setTempData(prepared_data);
      return false;
    }
    if(!isNumeric(data_to_validate.radius)) {
      //If Error occurs, set data back to last valid state
      setTempData(prepared_data);
      return false;
    }

    let pos_spherical_float = data_to_validate.pos_spherical.map(parseFloat);
    let vel_spherical_float = data_to_validate.vel_spherical.map(parseFloat);

    let vel_spherical_rad_s = [
        vel_spherical_float[0] / (365 * 24 * 60 * 60),
        vel_spherical_float[1] / (365 * 24 * 60 * 60),
        vel_spherical_float[2] / (365 * 24 * 60 * 60)
    ]

    return {
      "id": parseFloat(data_to_validate.id),
      "mass": parseFloat(data_to_validate.massBase) * Math.pow(10, parseFloat(data_to_validate.massExp)),
      "name": data_to_validate.name,
      "pos": sphericalToCartesian(
          parseFloat(data_to_validate.pos_spherical[0]),
          parseFloat(data_to_validate.pos_spherical[1]),
          parseFloat(data_to_validate.pos_spherical[2])
      ),
      "vel": sphericalToCartesianVelocity(
          pos_spherical_float,
          vel_spherical_rad_s
      ),
      "radius": data_to_validate.radius
    }
  }

  /**
   * Function which gets called when the Popover is toggled
   */
  function handlePopoverToggle() {
    if(popoverOpen) {
      let validatedData = validateData(tempData);
      //Important to keep the comparison without type coercion! validatedData can also be non-Boolean
      if(validatedData !== false) {
        mutateData(validatedData, data.id);
      }
      else {
        toast({
          title: "Error",
          description: "Invalid Values inserted. Only numerical Values allowed.",
          variant: "destructive"
        });
      }
    }
    setPopoverOpen(!popoverOpen);
  }

  return (
    <TableRow>
      <TableCell className="w-[10px] text-center"><div className="box" style={{backgroundColor: idToColor(data.id)}}>{data.id}</div></TableCell>
      <TableCell className="w-[200px] text-center"><Badge>{data.name}</Badge></TableCell>
      <TableCell className="w-[100px] text-center">{`${floatToBaseExp(data.mass)[0]}`} <br/> {`x 10^${floatToBaseExp(data.mass)[1]}`} kg</TableCell>
      <TableCell className="w-[160px] text-center">
        <Popover open={popoverOpen} onOpenChange={handlePopoverToggle}>
          <PopoverTrigger asChild>
            <Button variant="outline"><Pencil2Icon/></Button>
          </PopoverTrigger>
          <PopoverContent className="w-200">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Edit Object</h4>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-5 items-center gap-x-2">
                  <Label htmlFor="name" className="col-span-1 text-center"><Badge>Name</Badge></Label>
                  <Input
                      id="name"
                      value={tempData.name}
                      onChange={(e) => {
                        setTempData({...tempData, "name": e.target.value})
                      }}
                      className="col-span-4 h-8 w-80"
                  />
                </div>
                <div className="grid grid-cols-5 items-center gap-x-2">
                  <Label/>
                  <Label className="col-span-1 text-center"><Badge>Radius <br/> AU[/yr]</Badge></Label>
                  <Label className="col-span-1 text-center"><Badge>Theta <br/> RAD[/yr]</Badge></Label>
                  <Label className="col-span-1 text-center"><Badge>Phi <br/> RAD[/yr]</Badge></Label>
                </div>
                <div className="grid grid-cols-5 items-center gap-x-2">
                  <Label htmlFor="posx" className="col-span-1 text-center"><Badge>Position</Badge></Label>
                  <Input
                      id="posx"
                      value={tempData.pos_spherical[0]}
                      onChange={(e) => {
                        setTempData({...tempData, "pos_spherical": tempData.pos_spherical.with(0, e.target.value)})
                      }}
                      className="col-span-1 h-8 w-20"
                  />
                  <Input
                      id="posy"
                      value={tempData.pos_spherical[1]}
                      onChange={(e) => {
                        setTempData({...tempData, "pos_spherical": tempData.pos_spherical.with(1, e.target.value)})
                      }}
                      className="col-span-1 h-8 w-20"
                  />
                  <Input
                      id="posz"
                      value={tempData.pos_spherical[2]}
                      onChange={(e) => {
                        setTempData({...tempData, "pos_spherical": tempData.pos_spherical.with(2, e.target.value)})
                      }}
                      className="col-span-1 h-8 w-20"
                  />
                </div>
                <div className="grid grid-cols-5 items-center gap-x-2">
                  <Label htmlFor="velx" className="col-span-1 text-center"><Badge>Velocity</Badge></Label>
                  <Input
                      id="velx"
                      value={tempData.vel_spherical[0]}
                      onChange={(e) => {
                        setTempData({...tempData, "vel_spherical": tempData.vel_spherical.with(0, e.target.value)})
                      }}
                      className="col-span-1 h-8 w-20"
                  />
                  <Input
                      id="vely"
                      value={tempData.vel_spherical[1]}
                      onChange={(e) => {
                        setTempData({...tempData, "vel_spherical": tempData.vel_spherical.with(1, e.target.value)})
                      }}
                      className="col-span-1 h-8 w-20"
                  />
                  <Input
                      id="velz"
                      value={tempData.vel_spherical[2]}
                      onChange={(e) => {
                        setTempData({...tempData, "vel_spherical": tempData.vel_spherical.with(2, e.target.value)})
                      }}
                      className="col-span-1 h-8 w-20"
                  />
                </div>
                <div className="grid grid-cols-5 items-center gap-x-2">
                  <Label htmlFor="massBase" className="col-span-1 h-8 w-20 text-center"><Badge>Mass</Badge></Label>
                  <Input
                      id="massBase"
                      value={tempData.massBase}
                      onChange={(e) => {
                        setTempData({
                          ...tempData,
                          "massBase": e.target.value
                        })
                      }}
                      className="col-span-1 h-8 w-20"
                  />
                  <Label htmlFor="massExp" className="text-center">x 10^</Label>
                  <Input
                      id="massExp"
                      value={tempData.massExp}
                      onChange={(e) => {
                        setTempData({
                          ...tempData,
                          "massExp": e.target.value
                        })
                      }}
                      className="col-span-1 h-8 w-20"
                  />
                  <Label htmlFor="massExp" className="text-center w-10">kg</Label>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {" "}
        <Button variant="outline" onClick={() => {
          mutateData(new Map(), tempData.id)
        }}><TrashIcon></TrashIcon></Button>
      </TableCell>
    </TableRow>
  );
}

/**
 * Component which represents the SideMenu-Sheet used to set Data and control Simulation/Animation
 *
 * @param gl
 * @returns {Element}
 * @constructor
 */
export function SideMenu({getGL}) {
  const [data, setData] = useState([]);

  //Parameters that get set directly in the SideMenu
  //These Parameters are for the Simulation
  const [gBase, setGBase] = useState(6.674);
  const [gExp, setGExp] = useState(-11);
  const [timeSliderValue, setTimeSliderValue] = useState([1]);
  const [timeFactor, setTimeFactor] = useState("1")
  const [subSteps, setSubSteps] = useState([1]);
  const [trajectoryLength, setTrajectoryLength] = useState([128]);

  //States which represent if the SideMenu is opened and whether the Animation is running/paused
  const [open, setOpen] = useState(true);
  const [animating, setAnimating] = useState(false);

  const [importSelectorValue, setImportSelectorValue] = useState("0");

  //Datetime at the beginning of the Simulation
  let animationStartDatetime = new Date("June 2, 2024 15:49:00");
  const [datetime, setDatetime] = useState(animationStartDatetime);

  //Pass the getGL-Function to the Renderer
  renderer.getGL = getGL;
  //Pass Getter and Setter of the Datetime to Renderer
  renderer.getDatetime = () => datetime;
  renderer.setDatetime = setDatetime;
  //Pass Gamma aka Universal Gravitational Constant to Renderer
  simulator.gamma = gBase * Math.pow(10, gExp);

  //Toggle the SideMenu whenever the CTRL-Key is pressed
  useEventListener("keydown", (e) => {if(e.ctrlKey) setOpen(!open)});


  /**
   * Data Manipulation
   */

  /**
   * Mutates the data on GravitationalObjects stored in the App-Component and updates the Data in the Simulator.
   *
   * @param {Array} newDataPart   The Data which should be copied to the App-Component
   * @param {number} id           The object-ID of the newDataPart
   */
  function mutateData(newDataPart, id) {
    //Copy the Contents of the Data prop (for re-render to trigger)
    let updatedData = [...data];

    //If newDataPart == {}, then this id should be deleted
    if (newDataPart.size === 0) {
      updatedData.splice(id, 1);    //Delete object from List
      updatedData.map((elem, idx) => {elem.id = idx});    //Update the indices of other elements in list
    }
    //Else, just data update
    else {
      updatedData = updatedData.map((elem, idx) => idx === id ? newDataPart : data[idx]);
    }
    setData(updatedData);
    simulator.applyDataUpdate(updatedData);
  }

  /**
   * Loads the selected Example Scenario.
   */
  function loadExampleScenario() {
    const index = parseInt(importSelectorValue);

    //Transform Data (pos and vel) from Astronomical Units (or AU/AE) to kilometers
    var data_transformed = [];
    for (let object of scenarios[index].objects) {
      data_transformed.push({
        "id": object["id"],
        "name": object["name"],
        "pos": [object["pos"][0] / 149597870.7, object["pos"][1] / 149597870.7, object["pos"][2] / 149597870.7],
        "vel": [object["vel"][0] / 149597870.7, object["vel"][1] / 149597870.7, object["vel"][2] / 149597870.7],
        "mass": object["mass"],
        "radius": object["radius"]
      })
    }

    setData(data_transformed);
    animationStartDatetime = scenarios[index].date;
    setDatetime(new Date(animationStartDatetime))
  }

  /**
   * Add a new Object to the Simulation
   */
  function addNewObject() {
    let updatedData = [...data];
    updatedData.push({
      "id": updatedData.length,
      "name": "New Object",
      "pos": [0, 0, 0],
      "vel": [0, 0, 0],
      "mass": 1000,
      "radius": 12756
    })
    setData(updatedData);
  }


  /**
   * Data Uploading
   */

  /**
   * Uploads all Simulation-Data to the Simulator
   * @param {number} gBase - Base of Universal Gravitational Constant
   * @param {number} gExp - Exponent of Universal Gravitational Constant
   * @param {number[]} trajLength - Length of Trajectories in Simulation
   */
  function uploadSimulationData(gBase, gExp, trajLength) {
    simulator.gamma = gBase * Math.pow(10, gExp);
    simulator.trajectoryLength = trajLength[0];
  }

  /**
   * Uploads all Renderer-Data to the Renderer
   * @param timeFactor - Factor for timeSliderValue to set Unit (day/second, month/second, ...)
   * @param timeSliderValue - How many Simulation-Seconds per Real-Second
   * @param subSteps - Precision-Value / Sub-Stepping-Value
   */
  function uploadRendererData(timeFactor, timeSliderValue, subSteps) {
    renderer.timestep = parseFloat(timeFactor) * timeSliderValue[0];
    renderer.sub_steps = subSteps[0];
  }


  /**
   * Event Handlers
   */

  /**
   * Function that gets called whenever the Start-Stop-Animation-Button is clicked
   */
  function handleAnimate() {
    if(animating) {
      //Stop Animation
      renderer.stopRender();
      setAnimating(false);
    }
    else {
      //Start Animation
      setDatetime(animationStartDatetime);
      simulator.applyDataUpdate(data);
      uploadRendererData(timeFactor, timeSliderValue, subSteps);
      uploadSimulationData(gBase, gExp, trajectoryLength);
      renderer.startRender();
      setAnimating(true);
    }
  }

  /**
   * Event Handler for change of the Base-Value of Universal Gravitational Constant (G)
   * @param e
   */
  function gBaseChange(e) {
    setGBase(e.target.value);
    uploadSimulationData(e.target.value, gExp, trajectoryLength);
  }

  /**
   * Event Handler for change of the Exponent-Value of Universal Gravitational Constant (G)
   * @param e
   */
  function gExpChange(e) {
    setGExp(e.target.value);
    uploadSimulationData(gBase, e.target.value, trajectoryLength);
  }

  /**
   * Event Handler for change of the trajectoryLength
   * @param newValue
   */
  function trajectoryLengthChange(newValue) {
    setTrajectoryLength(newValue);
    uploadSimulationData(gBase, gExp, newValue);
  }

  /**
   * Event Handler for change of the Value of the Time-Factor (How many Simulation-Seconds in one Real-Second)
   * @param newValue
   */
  function timeSliderValueChange(newValue) {
    setTimeSliderValue(newValue);
    uploadRendererData(timeFactor, newValue, subSteps);
  }

  /**
   * Event Handler for change of the Value of the Time-Factor (How many Simulation-Seconds in one Real-Second)
   * @param newValue
   */
  function timeFactorChange(newValue) {
    setTimeFactor(newValue);
    uploadRendererData(newValue, timeSliderValue, subSteps);
  }

  /**
   * Event Handler for change of the Value of Sub-Stepping/Precision
   * @param newValue
   */
  function subStepsChange(newValue) {
    setSubSteps(newValue);
    uploadRendererData(timeFactor, timeSliderValue, newValue);
  }

  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              Edit Simulation Parameters
              <br/>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label className="col-span-2 w-30" htmlFor="timeFactor"><Badge>
                      {datetime.getDate()}.
                      {datetime.getMonth()}.
                      {datetime.getFullYear()}
                      {" - "}
                      {datetime.getHours() < 10 ? "0" + datetime.getHours().toString() : datetime.getHours()}:
                      {datetime.getMinutes() < 10 ? "0" + datetime.getMinutes().toString() : datetime.getMinutes()}:
                      {datetime.getSeconds() < 10 ? "0" + datetime.getSeconds().toString() : datetime.getSeconds()}
                    </Badge></Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Date and Time on Planet Earth</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </SheetTitle>
            <br/>
          </SheetHeader>
          <ScrollArea className="h-96 rounded-md border p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[10px] text-center">#</TableHead>
                  <TableHead className="w-[200px] text-center">Name</TableHead>
                  <TableHead className="w-[100px] text-center">Mass</TableHead>
                  <TableHead className="w-[160px] text-center">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ?
                    <TableRow><TableCell className="text-center">No Items</TableCell></TableRow> :
                    data.map((item, index) => <ObjectRepresentator key={index} data={item} mutateData={mutateData}/>)
                }
                <TableRow>
                  <TableCell className="w-[10px] text-center"/>
                  <TableCell className="w-[200px] text-center"/>
                  <TableCell className="w-[100px] text-center"/>
                  <TableCell className="w-[160px] text-center">
                    <Button variant="outline" onClick={addNewObject}><PlusCircledIcon/></Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </ScrollArea>
          <br/>
          <div className="grid gap-2 items-center grid-cols-10">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="col-span-2 w-30" htmlFor="timeFactor"><Badge>Time</Badge></Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>How much time should go by in the Simulation in one second of the Real Time</p>
                  <p>5 days per s => One Second in Real Time is equivalent to 5 days in Simulation Time</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Slider className="col-span-3 h-8 w-30" value={timeSliderValue} min={1} max={25}
                    onValueChange={timeSliderValueChange}></Slider>
            <Label>{timeSliderValue}</Label>
            <Select className="col-span-3 h-8 w-30" value={timeFactor} onValueChange={timeFactorChange}>
              <SelectTrigger className="col-span-3 w-[180px]">
                <SelectValue placeholder="unit"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">s per s</SelectItem>
                <SelectItem value="86400">days per s</SelectItem>
                <SelectItem value="2678400">months per s</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <br/>

          <div className="grid gap-2 items-center grid-cols-10">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="col-span-2 w-30" htmlFor="g"><Badge>Gamma</Badge></Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Universal Gravitational Constant</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Input
                id="gBase"
                type="number"
                value={gBase}
                onChange={gBaseChange}
                className="col-span-2 h-8 w-30"
            />
            <Label className="col-span-2 w-30 text-center" htmlFor="gExp">x 10^</Label>
            <Input
                id="gExp"
                type="number"
                value={gExp}
                onChange={gExpChange}
                className="col-span-2 h-8 w-30"
            />
            <Label className="col-span-2 w-30 text-center" htmlFor="gExp">Nm^2/kg^2</Label>
          </div>

          <br/>

          <div className="grid gap-2 items-center grid-cols-10">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="col-span-2 w-30" htmlFor="timeFactor"><Badge>Precision</Badge></Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>How many iterations of simulation should be performed per Simulation step</p>
                  <p>Higher Values allow to simulate large Timesteps with higher Precision</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Slider className="col-span-3 h-8 w-30" value={subSteps} min={1} max={25}
                    onValueChange={subStepsChange}></Slider>
            <Label className="w-20">{subSteps < 2 ? `${subSteps} Substep` : `${subSteps} Substeps`}</Label>
          </div>

          <br/>

          <div className="grid gap-2 items-center grid-cols-10">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label className="col-span-2 w-30" htmlFor="timeFactor"><Badge>Trajectory Length</Badge></Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Length of Trajectories in Simulation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Slider className="col-span-3 h-8 w-30" value={trajectoryLength} min={128} max={2048} disabled={animating}
                    onValueChange={trajectoryLengthChange}></Slider>
            <Label className="w-20">{`${trajectoryLength} Steps`}</Label>
          </div>

          <br/>

          <div className="grid gap-2 items-center grid-cols-10">
            <div className="col-span-7 h-8 w-30"/>
            <Button variant={animating ? "destructive" : ""} className="col-span-3 h-8 w-30"
                    onClick={handleAnimate}>{animating ? "Abort Animation" : "Start Animation"}</Button>
          </div>

          <br/>

          <SheetTitle>Example Scenarios</SheetTitle>

          <br/>

          <div className="grid gap-2 items-center grid-cols-10">
            <Select value={importSelectorValue} onValueChange={setImportSelectorValue}>
              <SelectTrigger className="col-span-5 w-[360px]">
                <SelectValue placeholder=""/>
              </SelectTrigger>
              <SelectContent>
                {scenarios.map((element, idx) => <SelectItem value={idx.toString()}>{element.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="col-span-3 h-8 w-30"></div>

            <Button className="col-span-2 h-8 w-30" onClick={loadExampleScenario}>Load</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}