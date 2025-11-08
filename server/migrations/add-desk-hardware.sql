-- Migration: Add desk-specific hardware items
-- Created: 2025-11-08
-- Description: Adds hardware items specific to desk/office furniture builds

INSERT INTO hardware_items (key, name, description, category, unit_price, unit_of_measure, default_qty, notes)
VALUES
  (
    'desk_legs',
    'Adjustable Desk Legs',
    'Height adjustable metal desk legs with leveling feet',
    'desk_hardware',
    25.00,
    'unit',
    4,
    'Set of 4 legs for standard rectangular desk'
  ),
  (
    'keyboard_slides',
    'Keyboard Tray Slides',
    'Under-desk keyboard tray slides with full extension',
    'desk_hardware',
    15.00,
    'pair',
    1,
    'Includes mounting hardware'
  ),
  (
    'cable_grommets',
    'Cable Management Grommets',
    'Desktop cable pass-through grommets (60mm diameter)',
    'desk_hardware',
    5.00,
    'unit',
    2,
    'Available in black, white, or silver'
  ),
  (
    'monitor_arm',
    'Monitor Arm Mount',
    'VESA compatible single monitor arm with gas spring',
    'desk_hardware',
    45.00,
    'unit',
    1,
    'Supports monitors up to 27 inches'
  ),
  (
    'cpu_holder',
    'CPU Holder/Tower Mount',
    'Under-desk CPU holder with adjustable width',
    'desk_hardware',
    12.00,
    'unit',
    1,
    'Adjustable 140mm-220mm width'
  ),
  (
    'cable_tray',
    'Cable Management Tray',
    'Under-desk wire cable tray basket',
    'desk_hardware',
    18.00,
    'unit',
    1,
    'Length: 400mm, includes mounting brackets'
  ),
  (
    'desk_drawer_slides',
    'Desk Drawer Slides',
    'Heavy-duty full-extension drawer slides (400mm)',
    'desk_hardware',
    12.00,
    'pair',
    1,
    'Load capacity: 35kg per pair'
  ),
  (
    'file_drawer_slides',
    'File Drawer Slides',
    'Heavy-duty file drawer slides (500mm) with lock',
    'desk_hardware',
    20.00,
    'pair',
    1,
    'Load capacity: 45kg, lateral file support'
  ),
  (
    'overhead_cabinet_hinges',
    'Overhead Cabinet Hinges',
    'Soft-close concealed hinges for overhead cabinets',
    'desk_hardware',
    4.50,
    'pair',
    2,
    '110° opening angle with soft-close damper'
  ),
  (
    'push_latch',
    'Push-to-Open Latch',
    'Touch latch for handle-free cabinet doors',
    'desk_hardware',
    3.00,
    'unit',
    2,
    'Magnetic catch with push-release mechanism'
  )
ON CONFLICT (key) DO NOTHING;
