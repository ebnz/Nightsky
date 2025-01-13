/**
 * scenarios is a list containing sample scenarios of the Solar-System-Simulation which can be loaded.
 *
 * One Scenario in the List is a JS-object consisting of the keys name, date and objects.
 * name: Name of the Scenario as String
 * date: Date of the Scenario as String following the Format: June 2, 2024 15:49:00
 * objects: List of Objects in this Scenario
 *
 * One Object of a Scenario is a JS-object consisting of the keys id, name, pos, vel, mass and radius
 * id: Unique int ID
 * name: Name of the Object as String
 * pos: Array of length 3 containing x, y and z-Coordinates of the initial Position of the Object
 * vel: Array of length 3 containing x, y and z-Coordinates of the initial Velocity of the Object
 * mass: Mass of the Object
 * radius: Radius of the Object
 *
 * Units: (Cartesian Coordinates!)
 * pos: kilometers
 * vel: kilometers/second
 * mass: kg
 * radius: kilometers
 */

export const scenarios = [
    {
       "name": "Empty",
       "date": "June 2, 2024 15:49:00",
       "objects": []
    },
    {
        "name": "Solar System",
        "date": "June 2, 2024 15:49:00",
        "objects": [
            {
                "id": 0,
                "name": "Sun",
                "pos": [0, 0, 0],
                "vel": [0, 0, 0],
                "mass": 1.989 * Math.pow(10, 30),
                "radius": 696342
            },
            {
                "id": 1,
                "name": "Merkur",
                "pos": [0.387098 * 149597870.7, 0, 0],
                "vel": [0, 47.36, 0],
                "mass": 3.301 * Math.pow(10, 23),
                "radius": 4881
            },
            {
                "id": 2,
                "name": "Venus",
                "pos": [0.7233 * 149597870.7, 0, 0],
                "vel": [0, 35.02, 0],
                "mass": 4.8673 * Math.pow(10, 24),
                "radius": 12103
            },
            {
                "id": 3,
                "name": "Earth",
                "pos": [149597870.7, 0, 0],
                "vel": [0, 29.78, 0],
                "mass": 5.972 * Math.pow(10, 24),
                "radius": 12756
            },
            {
                "id": 4,
                "name": "Mars",
                "pos": [1.524 * 149597870.7, 0, 0],
                "vel": [0, 24.07, 0],
                "mass": 6.417 * Math.pow(10, 23),
                "radius": 6792
            },
            {
                "id": 5,
                "name": "Jupiter",
                "pos": [5.204 * 149597870.7, 0, 0],
                "vel": [0, 13.06, 0],
                "mass": 1.89813 * Math.pow(10, 27),
                "radius": 142984
            },
            {
                "id": 6,
                "name": "Saturn",
                "pos": [9.582 * 149597870.7, 0, 0],
                "vel": [0, 9.68, 0],
                "mass": 5.683 * Math.pow(10, 26),
                "radius": 120536
            },
            {
                "id": 7,
                "name": "Uranus",
                "pos": [19.201 * 149597870.7, 0, 0],
                "vel": [0, 6.81, 0],
                "mass": 8.681 * Math.pow(10, 25),
                "radius": 51118
            },
            {
                "id": 8,
                "name": "Neptun",
                "pos": [30.178 * 149597870.7, 0, 0],
                "vel": [0, 5.455, 0],
                "mass": 1.024 * Math.pow(10, 26),
                "radius": 49528
            }
        ]
    },
    {
        "name": "Drifting System",
        "date": "June 2, 2024 15:49:00",
        "objects": [
            {
                "id": 0,
                "name": "Sun",
                "pos": [0, 0, 0],
                "vel": [0, 0, 0],
                "mass": 1.989 * Math.pow(10, 30),
                "radius": 696342
            },
            {
                "id": 1,
                "name": "Merkur",
                "pos": [0.387098 * 149597870.7, 0, 0],
                "vel": [0, 47.36, 0],
                "mass": 3.301 * Math.pow(10, 29),
                "radius": 4881
            },
            {
                "id": 2,
                "name": "Venus",
                "pos": [0.7233 * 149597870.7, 0, 0],
                "vel": [0, 35.02, 0],
                "mass": 4.8673 * Math.pow(10, 24),
                "radius": 12103
            },
            {
                "id": 3,
                "name": "Earth",
                "pos": [1 * 149597870.7, 0, 0],
                "vel": [0, 29.78, 0],
                "mass": 5.972 * Math.pow(10, 24),
                "radius": 12756
            },
            {
                "id": 4,
                "name": "Mars",
                "pos": [1.524 * 149597870.7, 0, 0],
                "vel": [0, 24.07, 0],
                "mass": 6.417 * Math.pow(10, 23),
                "radius": 6792
            },
            {
                "id": 5,
                "name": "Jupiter",
                "pos": [5.204 * 149597870.7, 0, 0],
                "vel": [0, 13.06, 0],
                "mass": 1.89813 * Math.pow(10, 27),
                "radius": 142984
            },
            {
                "id": 6,
                "name": "Saturn",
                "pos": [9.582 * 149597870.7, 0, 0],
                "vel": [0, 9.68, 0],
                "mass": 5.683 * Math.pow(10, 26),
                "radius": 120536
            },
            {
                "id": 7,
                "name": "Uranus",
                "pos": [19.201 * 149597870.7, 0, 0],
                "vel": [0, 6.81, 0],
                "mass": 8.681 * Math.pow(10, 25),
                "radius": 51118
            },
            {
                "id": 8,
                "name": "Neptun",
                "pos": [30.178 * 149597870.7, 0, 0],
                "vel": [0, 5.455, 0],
                "mass": 1.024 * Math.pow(10, 26),
                "radius": 49528
            }
        ]
    }
]