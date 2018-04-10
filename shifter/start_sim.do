vlib -c work
vcom -2008 shifter.vhd shifter_tb.vhd -work work
vsim -c -L work.lib shifter_tb
vsim run
