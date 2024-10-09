import {AEToM, directedAcceleration, MToAE} from "../utils/VectorUtils";
import {Sphere} from "../Geometry/GeometryJS";
import {hexToRGB, idToColor} from "../utils/uiUtils";

export class SolarSystemSimulator {
    /**
     * Represents a complete Solar System with Simulation Functionality.
     * @param {number} gamma - Universal Gravitational Constant
     */
    constructor(gamma) {
        this.gamma = gamma;

        //[Mass in kg, Radius in ?, Position in AU, Velocity in m/s]
        this.objects = [];
    }

    /**
     * Simulate one timestep and update the values of the respective Objects.
     * @param {number} dt - Length of Timestep
     */
    simulate(dt) {
        for (let i = 0; i < this.objects.length; i++) {
            let posA = AEToM(this.objects[i].position);
            let acceleration = [0.0, 0.0, 0.0];
            for (let j = 0; j < this.objects.length; j++) {
                if (i === j) {
                    continue;
                }

                let posB = AEToM(this.objects[j].position);

                let distance_squared = Math.pow(posA[0] - posB[0], 2) +
                    Math.pow(posA[1] - posB[1], 2) +
                    Math.pow(posA[2] - posB[2], 2);

                if (distance_squared === 0) {
                    continue;
                }

                const scalar_acceleration = this.gamma * this.objects[j].mass / distance_squared;
                const directed_acceleration = directedAcceleration(
                    posA,
                    posB,
                    scalar_acceleration
                );
                acceleration[0] += directed_acceleration[0];
                acceleration[1] += directed_acceleration[1];
                acceleration[2] += directed_acceleration[2];
            }

            let velocity = AEToM(this.objects[i].velocity);

            velocity = [
                velocity[0] + acceleration[0] * dt,
                velocity[1] + acceleration[1] * dt,
                velocity[2] + acceleration[2] * dt
            ];

            this.objects[i].position = MToAE([
                posA[0] + velocity[0] * dt,
                posA[1] + velocity[1] * dt,
                posA[2] + velocity[2] * dt
            ]);

            this.objects[i].velocity = MToAE(velocity);
        }
    }

    /**
     * Simulate one timestep and update the values of the respective Objects.
     * The timestep is parted into multiple sub-steps to increase precision.
     * @param {number} dt - Length of timestep
     * @param {number} num_steps - Number of sub-steps
     */
    simulateMultiple(dt, num_steps) {
        const dt_sub = dt / num_steps;
        for (let step = 0; step < num_steps; step++) {
            this.simulate(dt_sub);
        }
    }

    /**
     * Add an Object to this Solar System.
     * @param {GravitationalObject} object - Object to add.
     */
    addObject(object) {
        this.objects.push(object);
    }

    /**
     * Delete an Object from this Solar System.
     * @param {number} index - Index of the Object to delete.
     */
    deleteObject(index) {
        this.objects.splice(index, 1);
    }

    /**
     * Set Data of all GravitationalObjects. This does NOT include Simulation-Data (e.g. gamma)
     * @param {{}} data - Data-Object of all GravitationalObjects
     */
    applyDataUpdate(data) {
        let newObjects = data.map(
            (elem, idx) => new GravitationalObject(
                elem.id,
                elem.mass,
                elem.radius,
                elem.pos,
                elem.vel
            )
        );
        let objectsCopy = this.objects.filter((elem, idx) => elem.id === -1);
        for (let item of newObjects) {
            objectsCopy.push(item);
        }

        this.objects = objectsCopy;
    }
}

class GravitationalObject {
    /**
     * Represents an Object with gravitational properties.
     * @param {number} id - ID of the Object
     * @param {number} mass - Mass of the Object
     * @param {number} radius - Radius of the Object
     * @param {[number, number, number]} position - Position of the Object
     * @param {[number, number, number]} velocity - Velocity of the Object
     */
    constructor(id, mass, radius, position, velocity) {
        this.MAX_TRAJECTORY_LENGTH = 128;

        this.id = id;
        this.mass = mass;
        this.radius = radius;
        this._position = position;
        this.velocity = velocity;
        this.color = hexToRGB(idToColor(this.id));

        this.bufferContent = [];

        this.lastPositions = [];

        this.updateBufferContent();
    }

    /**
     * Getter for the Position of this GravitationalObject.
     * @returns {[number,number,number]}
     */
    get position() {
        return this._position;
    }

    /**
     * Setter for the Position of this GravitationalObject.
     * @param {[number, number, number]} newPos - New Position
     */
    set position(newPos) {
        this.lastPositions.push(this._position[0], this._position[1], this._position[2]);

        if (this.lastPositions.length > 3 * this.MAX_TRAJECTORY_LENGTH) {
            this.lastPositions.splice(0, 3);
        }

        this._position = newPos;
    }

    /**
     * Sets the Vertexbuffer-Content for this Object
     */
    updateBufferContent() {
        let sphere = new Sphere(this.radius / (1.496 * Math.pow(10, 8)), 8, 16);
        this.bufferContent = sphere.getArrayBufferContent();
    }
}