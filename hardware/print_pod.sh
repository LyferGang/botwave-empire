#!/bin/bash
# Convert STEP files to STL using OpenSCAD

src_dir="/home/gringo/Downloads/Super Patriot Series 2/Frames"

for step_file in "$src_dir"/*.step; do
    if [ -f "$step_file" ]; then
        base=$(basename "$step_file" .step)
        stl_file="$src_dir/${base}.stl"
        echo "Converting $base.step -> ${base}.stl"
        openscad -o "$stl_file" "$step_file" 2>&1 || echo "Failed: $step_file"
    fi
done

echo "Done!"
