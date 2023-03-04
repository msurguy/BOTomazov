''' Configuration file for SVG to GCODE converter
    Date: 26 Oct 2016
    Author: Peter Scriven
'''


'''G-code emitted at the start of processing the SVG file'''
preamble = "G21\nG90\nM3S100\n"

'''G-code emitted at the end of processing the SVG file'''
postamble = "G0 X0Y0\nM3S100"

'''G-code emitted before processing a SVG shape'''
shape_preamble = "G4P0.1\n"

'''G-code emitted after processing a SVG shape'''
shape_postamble = "M3S100\nG4P0.1"

# A4 area:               210mm x 297mm
# Printer Cutting Area: ~178mm x ~344mm
# Testing Area:          150mm x 150mm  (for now)
'''Print bed width in mm'''
bed_max_x = 287

'''Print bed height in mm'''
bed_max_y = 135

''' Used to control the smoothness/sharpness of the curves.
    Smaller the value greater the sharpness. Make sure the
    value is greater than 0.1'''
smoothness = 0.2
