/*
    Name: Malik Alghneimin
    Date: November 5th 2023
    Description: This program simulates a block sliding down an inclined plane. The user is required to input the angle of the inclined plane and the coefficient of the friction.
*/

// SFML version: 2.6.0
#include <SFML/Graphics.hpp>
#include <iostream>
#include <cmath>
#include <windows.h>

const float g = 9.8f; // Acceleration due to gravity (m/s^2)
const float pi = 3.14159265359; // Used to convert degrees to radians for proper computing calculation

// Defines colour codes to be used for colouring text

// Main Program
int main() {
    // Variables
    float angle;
    float frictionCoefficient;

    // Gathers the console info
    HANDLE hConsole = GetStdHandle(STD_OUTPUT_HANDLE);
    CONSOLE_SCREEN_BUFFER_INFO consoleInfo;
    GetConsoleScreenBufferInfo(hConsole, &consoleInfo);
    WORD saved_attributes = consoleInfo.wAttributes;

    // Ask the user for the angle of the inclined plane
    std::cout << "Enter a value for the angle of the inclined plane (no [-] value): " << std::endl;
    std::cin >> angle;
    angle = angle * (pi / 180); // Convert angle from degree to radians

    // Ask the user for the coefficient of friction force
    std::cout << "Enter a value for the coefficient of friction (no [-] value): " << std::endl;
    std::cin >> frictionCoefficient;

    // Calculate forces
    float gravityAccel = g * sin(angle); // Force of gravity parallel to the plane
    float frictionForce = frictionCoefficient * g * cos(angle); // Force of friction parallel to the plane

    // Output information

    std::cout << "Gravity force parallel to the plane. (Fgsin)" << std::endl;

    std::cout << "Normal force perpendicular to the plane. (Fn)" << std::endl;

    std::cout << "Friction force parallel to the plane. (Ffcos)" << std::endl;

    std::cout << "Gravity force. (Fg)" << std::endl;


    // Creating shapes to draw
    sf::ConvexShape inclinedPlane;
    inclinedPlane.setPointCount(3);
    inclinedPlane.setFillColor(sf::Color(141, 141, 141));
    inclinedPlane.setPoint(0, sf::Vector2f(0, 800));
    inclinedPlane.setPoint(1, sf::Vector2f(800 * cos(angle), 800 - 800 * sin(angle)));
    inclinedPlane.setPoint(2, sf::Vector2f(800 * cos(angle), 800));

    // Lines for the free-body diagram
    sf::Vertex gravityLine[2] = {
        sf::Vertex(sf::Vector2f()),
        sf::Vertex(sf::Vector2f())
    };

    sf::Vertex normalLine[2] = {
        sf::Vertex(sf::Vector2f()),
        sf::Vertex(sf::Vector2f())
    };

    sf::Vertex frictionLine[2] = {
        sf::Vertex(sf::Vector2f()),
        sf::Vertex(sf::Vector2f())
    };

    sf::Vertex weightLine[2] = {
        sf::Vertex(sf::Vector2f()),
        sf::Vertex(sf::Vector2f())
    };

    // Create the object
    sf::ConvexShape block;
    block.setFillColor(sf::Color(255, 0, 0));
    block.setPointCount(4);

    // Create a new window to display simulation
    sf::RenderWindow window(sf::VideoMode(800 * cos(angle), 800), "Simulated Slide");
    window.setFramerateLimit(60);

    // Used to display the time in the simulation
    sf::Clock clock;
    sf::Time time;
    int previousTime = (int)time.asSeconds();

    sf::Vector2f position(inclinedPlane.getPoint(1).x - 50 * cos(angle), inclinedPlane.getPoint(1).y + 50 * sin(angle)); // Initial position (x, y)
    sf::Vector2f velocity(0, 0);  // Initial velocity (horizontal, vertical)

    float deltaTime = 0.016f; // Time step (adjust for smooth animation)

    // Loop to keep the graphics window open
    while (window.isOpen()) {
        // Manages and displays time
        time = clock.getElapsedTime();
        if (previousTime != (int)time.asSeconds()) {
            std::cout << "\rGraphics runtime: " << (int)time.asSeconds() << "s";
        }
        previousTime = (int)time.asSeconds();

        // Check if the window is closed
        sf::Event event;
        while (window.pollEvent(event)) {
            if (event.type == sf::Event::Closed) {
                std::cout << "\rTime: " << time.asSeconds() << "s" << std::endl;
                window.close();
            }
        }

        // Update position for animation
        position.x += velocity.x * deltaTime;
        position.y += velocity.y * deltaTime;

        // Update velocity (Uses the forces parallel to the plane)
        velocity.y += (gravityAccel * sin(angle) - frictionForce * sin(angle)) * deltaTime;
        velocity.x -= (gravityAccel * cos(angle) - frictionForce * cos(angle)) * deltaTime;

        sf::Vector2f positionTwo(position.x - 50 * sin(angle), position.y - 50 * cos(angle));

        // Update the shapes information
        block.setPoint(0, position);
        block.setPoint(1, positionTwo);
        block.setPoint(2, positionTwo + sf::Vector2f(50 * cos(angle), -50 * sin(angle)));
        block.setPoint(3, position + sf::Vector2f(50 * cos(angle), -50 * sin(angle)));

        gravityLine[0] = sf::Vertex(sf::Vector2f(position.x + (positionTwo.x - position.x) / 2, position.y + (positionTwo.y - position.y) / 2), sf::Color::Green);
        gravityLine[1] = sf::Vertex(sf::Vector2f(gravityLine[0].position.x - 30 * cos(angle), gravityLine[0].position.y + 30 * sin(angle)), sf::Color::Green);

        normalLine[0] = sf::Vertex(sf::Vector2f(positionTwo.x + (block.getPoint(2).x - positionTwo.x) / 2, positionTwo.y + (block.getPoint(2).y - positionTwo.y) / 2), sf::Color::Blue);
        normalLine[1] = sf::Vertex(sf::Vector2f(normalLine[0].position.x - 30 * sin(angle), normalLine[0].position.y - 30 * cos(angle)), sf::Color::Blue);

        frictionLine[0] = sf::Vertex(sf::Vector2f(block.getPoint(3).x + (block.getPoint(2).x - block.getPoint(3).x) / 2, block.getPoint(3).y + (block.getPoint(2).y - block.getPoint(3).y) / 2), sf::Color::Yellow);
        frictionLine[1] = sf::Vertex(sf::Vector2f(frictionLine[0].position.x + 30 * cos(angle), frictionLine[0].position.y - 30 * sin(angle)), sf::Color::Yellow);

        weightLine[0] = sf::Vertex(sf::Vector2f(position.x + (block.getPoint(3).x - position.x) / 2, position.y + (block.getPoint(3).y - position.y) / 2), sf::Color::Red);
        weightLine[1] = sf::Vertex(sf::Vector2f(weightLine[0].position.x, weightLine[0].position.y + 30), sf::Color::Red);

        // Draws the block, inclined planed, and the FBD lines
        window.clear();
        window.draw(block);
        window.draw(inclinedPlane);
        window.draw(gravityLine, 2, sf::Lines);
        window.draw(normalLine, 2, sf::Lines);
        window.draw(frictionLine, 2, sf::Lines);
        window.draw(weightLine, 2, sf::Lines);
        window.display();

        sf::sleep(sf::milliseconds(16)); // Limit the frame rate

        // Check for collision with the ground (y = 0) 
        if (position.y >= 800) {
            // Displays the final time of the graphics runtime
            std::cout << "\rGraphics runtime: " << time.asSeconds() << "s\t";

            system("pause");
            window.close();
        }
        else if (velocity.x >= 0) {
            std::cout << "Block will not move (Friction force > Gravity force).\n" << std::endl;

            system("pause");
            window.close();
        }
    }


    return 0;
}