"""

Author: Malik Alghneimin
Date: 01/17/2024
SPH4U Strand Task 5: 

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
pygame.display.set_caption("Diffraction grating simulation")

# Set up text
FONT = pygame.font.SysFont("Arial", 24)
COLOR_INACTIVE = pygame.Color('lightskyblue3')
COLOR_ACTIVE = pygame.Color('dodgerblue2')
WHITE = pygame.Color('white')
BLACK = pygame.Color('black')

# Base for input box
class InputBox:
    """
    Parameters:
    x -> x position of the text box
    y -> y position of the text box
    w -> width of the text box
    h -> height of the text box
    text -> text to be displayed
    
    """
    def __init__(self, x, y, w, h, text=''):
        self.rect = pygame.Rect(x, y, w, h)
        self.color = COLOR_INACTIVE
        self.text = text
        self.txt_surface = FONT.render(text, True, self.color)
        self.active = False

    def handle_event(self, event):
        if event.type == pygame.MOUSEBUTTONDOWN:
            # If the user clicked on the input_box rect.
            if self.rect.collidepoint(event.pos):
                # Toggle the active variable.
                self.active = not self.active
            else:
                self.active = False
            # Change the current color of the input box.
            self.color = COLOR_ACTIVE if self.active else COLOR_INACTIVE
        if event.type == pygame.KEYDOWN:
            if self.active:
                if event.key == pygame.K_RETURN:
                    print(self.text)
                    self.active = False
                elif event.key == pygame.K_BACKSPACE:
                    self.text = self.text[:-1]
                else:
                    self.text += event.unicode
                # Re-render the text.
                self.txt_surface = FONT.render(self.text, True, self.color)

    def update(self):
        # Resize the box if the text is too long.
        width = max(200, self.txt_surface.get_width()+10)
        self.rect.w = width

    def draw(self, screen):
        # Blit the text.
        screen.blit(self.txt_surface, (self.rect.x+5, self.rect.y+5))
        # Blit the rect.
        pygame.draw.rect(screen, self.color, self.rect, 2)

# Draws gradients
def fill_gradient(surface, color, gradient, rect=None, vertical=True, forward=True):
    """
    fill a surface with a gradient pattern
    Parameters:
    color -> starting color
    gradient -> final color
    rect -> area to fill; default is surface's rect
    vertical -> True=vertical; False=horizontal
    forward -> True=forward; False=reverse
    
    Pygame recipe: http://www.pygame.org/wiki/GradientCode
    """
    if rect is None: rect = surface.get_rect()
    x1,x2 = rect.left, rect.right
    y1,y2 = rect.top, rect.bottom
    if vertical: h = y2-y1
    else:        h = x2-x1
    if forward: a, b = color, gradient
    else:       b, a = color, gradient
    rate = (
        float(b[0]-a[0])/h,
        float(b[1]-a[1])/h,
        float(b[2]-a[2])/h
    )
    fn_line = pygame.draw.line
    if vertical:
        for line in range(y1,y2):
            color = (
                min(max(a[0]+(rate[0]*(line-y1)),0),255),
                min(max(a[1]+(rate[1]*(line-y1)),0),255),
                min(max(a[2]+(rate[2]*(line-y1)),0),255)
            )
            fn_line(surface, color, (x1,line), (x2,line))
    else:
        for col in range(x1,x2):
            color = (
                min(max(a[0]+(rate[0]*(col-x1)),0),255),
                min(max(a[1]+(rate[1]*(col-x1)),0),255),
                min(max(a[2]+(rate[2]*(col-x1)),0),255)
            )
            fn_line(surface, color, (col,y1), (col,y2))

def drawSimulation(x):
    middle = screen.get_width() // 2
    i = 1
    while True:
        
        
        drawRightSide1 = pygame.Rect(middle + x * (i - 1), 200, x, 379)
        drawRightSide2 = pygame.Rect(middle + x * i, 200, x, 379)

        drawLeftSide1 = pygame.Rect(middle - x * i, 200, x, 379)
        drawLeftSide2 = pygame.Rect(middle - x * (i + 1), 200, x, 379)

        fill_gradient(screen, WHITE, BLACK, drawRightSide1, False, True)
        fill_gradient(screen, BLACK, WHITE, drawRightSide2, False, True)
        fill_gradient(screen, BLACK, WHITE, drawLeftSide1, False, True)
        fill_gradient(screen, WHITE, BLACK, drawLeftSide2, False, True)
        i += 2
        if (middle + x * i) > screen.get_width():
            break

        

    

# Main program
def main():
    # Start clock for ticks
    clock = pygame.time.Clock()

    wavelength = 500
    spacing = 20
    distance = 0.1
    

    # Text and input boxes
    text1 = FONT.render("Wavelength of light (in nm): ", False, WHITE)
    input_box1 = InputBox(20, 50, 140, 32)
    text2 = FONT.render("Spacing of the diffraction grating (in nm): ", False, WHITE)
    input_box2 = InputBox(350, 50, 140, 32)
    text3 = FONT.render("Distance to the screen (in m): ", False, WHITE)
    input_box3 = InputBox(20, 130, 140, 32)
    input_boxes = [input_box1, input_box2, input_box3]

    done = False

    input_box1.text = f"{wavelength}"
    input_box2.text = f"{spacing}"
    input_box3.text = f"{distance}"

    simulationAreaBorder = pygame.Surface((800, 386))
    simulationArea = pygame.Rect(20, 200, 760, 380)
    simulationAreaBorder.fill(WHITE)

    # During screen runtime
    while not done:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                done = True
            for box in input_boxes:
                box.handle_event(event)

        for box in input_boxes:
            box.update()

        screen.fill((30, 30, 30))
        for box in input_boxes:
            box.draw(screen)
        if input_box1.color != COLOR_ACTIVE:
            if input_box1.text != '' and not input_box1.text.isalpha() and input_box1.text != '0': 
                wavelength = float(input_box1.text) * 1e-9
        if input_box2.color != COLOR_ACTIVE:
            if input_box2.text != '' and not input_box2.text.isalpha() and input_box2.text != '0': 
                spacing = float(input_box2.text) * 1e-6
        if input_box3.color != COLOR_ACTIVE:
            if input_box3.text != '' and not input_box3.text.isalpha() and input_box3.text != '0': 
                distance = float(input_box3.text)
        
        
        #fill_gradient(screen, (255,255,255), (0,0,0), simulationArea, False, True)

        screen.blit(text1, (20,20))
        screen.blit(text2, (350,20))
        screen.blit(text3, (20, 100))
        screen.blit(simulationAreaBorder, (0, 197))
        pygame.draw.rect(screen, (0,0,0), simulationArea)
        #fill_gradient(screen, (255,255,255), (0,0,0), simulationArea, False, True)

        between = (wavelength / distance) * spacing * 1e12
        
        drawSimulation(between)
        
        # Update screen
        pygame.display.flip()
        clock.tick(30)

# Operation of the program
if __name__ == '__main__':
    main()
    pygame.quit()
