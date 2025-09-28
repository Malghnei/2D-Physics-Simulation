"""

Author: Malik Alghneimin
Date: 01/17/2024
SPH4U Strand Task 4:

"""

# Importing the necessary libraries
import sys
import pygame
from pygame import draw

# Initialize Pygame
pygame.init()

# Set up display
width, height = 800, 600
screen = pygame.display.set_mode((width, height))
pygame.display.set_caption("CRT (Cathode-ray tube) simulation")

# Set up text
sysfont = pygame.font.SysFont("Arial", 24)


# draws the trajectory
def drawTrajectory(x, y, vx, acceleration, length, between):
  global vy
  global time
  global height
  global distance

  height = 0
  distance = 0
  vy = 0
  time = 0
  while y > 0 and y < screen.get_height():
    pygame.draw.circle(screen, (255, 255, 255), pygame.math.Vector2(x, y), 2)
    if y > (screen.get_height() // 2) + between // 2 or \
    y < (screen.get_height() // 2) - between // 2:
      if x < length + 20:
        height = (screen.get_height() // 2 + y) / 200
        distance = (x - 20) / 200

        break
    if x > 20 + length:
      height = (screen.get_height() // 2 - y) / 200
      distance = (x - 20) / 200

      break

    if x > 20 and x <= length + 20:
      vy += acceleration * time / 1e13

    x += vx * time / 1e9
    y -= vy * time / 1e9

    time += 1e-5


# Variables
length = float(input("Enter the length of the plates (in cm): ")) * 200
distanceBetween = float(
    input("Enter the length of the plates (in cm): ")) * 200
potentialDifference = float(
    input("Enter the potential difference between the plates (in V): "))
initialSpeed = float(
    input("Enter the initial speed of the electron (in m/s): "))

electronMass = 9.11e-31
electronCharge = 1.602e-19
acceleration = (electronCharge * (potentialDifference /
                                  (distanceBetween / 10000)) / electronMass)
middle = screen.get_height() // 2

# Main program

# Main loop
while True:
  for event in pygame.event.get():
    if event.type == pygame.QUIT:
      pygame.quit()
      sys.exit()
  # Draws the trajectory path of the electron
  drawTrajectory(0, middle, initialSpeed, acceleration, length,
                 distanceBetween)

  pygame.draw.line(screen, (255, 255, 0), (20, middle + distanceBetween // 2),
                   (20 + length, middle + distanceBetween // 2))
  pygame.draw.line(screen, (255, 255, 0), (20, middle - distanceBetween // 2),
                   (20 + length, middle - distanceBetween // 2))
  # Clear the screen
  # screen.fill((0, 0, 0))
  text1 = sysfont.render(
      f"distance of the electron travelled (in cm): {distance}", False,
      (255, 255, 255))
  text2 = sysfont.render(f"height of the electron (in cm): {height}", False,
                         (255, 255, 255))
  text3 = sysfont.render(f"Time (in ps): {time * 1000}", False,
                         (255, 255, 255))

  screen.blit(text1, (20, 20))
  screen.blit(text2, (20, 50))
  screen.blit(text3, (20, 80))

  # Update the display
  pygame.display.update()

  # Set the frame rate
  pygame.time.Clock().tick(60)
