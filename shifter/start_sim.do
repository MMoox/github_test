vlib -c work
vcom -2008 -dbg *.vhd -work work
vsim -c -L work.lib shifter_tb
run
