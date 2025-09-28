#include <SFML/Graphics.hpp>
#include <iostream>
#include <cmath>

const float g = 9.8f; // Acceleration due to gravity (m/s^2)

int main() {
    // Variables for the user to decide
    float initialVelocity;
    float height;
    float angle;

    // Ask the user for values
    std::cout << "Enter a value for launch velocity: " << std::endl;
    std::cin >> initialVelocity;

    std::cout << "Enter a value for height (Max. Value: 780): " << std::endl;
    std::cin >> height;

    std::cout << "Enter a value for angle [Below (-) or above (+) the horizontal]" << std::endl;
    std::cin >> angle;

    // Create a new window to display simulation
    sf::RenderWindow window(sf::VideoMode(1600, 800), "Projectile Motion");
    window.setFramerateLimit(60);

    // Creating shapes to draw
    sf::CircleShape projectile(10); // Create a circular object as the projectile
    projectile.setFillColor(sf::Color::Red);

    sf::RectangleShape border(sf::Vector2f(1500, 700));
    border.setOutlineThickness(2);
    border.setFillColor(sf::Color(0, 0, 0));
    border.setOutlineColor(sf::Color(255, 255, 255));
    border.setPosition(sf::Vector2f(50, 50));

    // Creating Text to display statistics
    sf::Text velocityY;
    sf::Text velocityX;
    sf::Text h;

    // Initial position and velocity
    sf::Vector2f position(70, 780 - height); // Initial position (x, y)
    sf::Vector2f velocity(initialVelocity * cos(angle * (3.14159265359/180)), initialVelocity * -sin(angle * (3.14159265359 / 180)));  // Initial velocity (horizontal, vertical)

    float deltaTime = 0.016f; // Time step (adjust for smooth animation)

    while (window.isOpen()) {
        sf::Event event;
        while (window.pollEvent(event)) {
            if (event.type == sf::Event::Closed)
                window.close();
        }

        // Update position based on physics equations
        position.x += velocity.x * deltaTime;
        position.y += velocity.y * deltaTime;

        // Update velocity (vertical) based on gravity
        velocity.y += g * deltaTime;

        // Check for collision with the ground (y = 0)
        if (position.y >= 780) {
            position.y = 780; // Prevent it from going below the ground
            velocity.x = 0;
            
        }

        projectile.setPosition(position);

        window.clear();
        window.draw(border);
        window.draw(projectile);
        window.display();

        sf::sleep(sf::milliseconds(16)); // Limit the frame rate
    }

    return 0;
}