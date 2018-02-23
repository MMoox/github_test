cd /home/moox/git/github_test/shifter
vlib -c work
vcom -coverage sb -coverage_options count -2008 shifter.vhd shifter_tb.vhd -work work
vsim -acdb -acdb_file acdb/tb_test1.acdb -c -L work.lib shifter_tb
run -all;
endsim
acdb report -db acdb/tb_test1.acdb -html -o acdb/tb_test1.html
exit
