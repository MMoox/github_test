------------------------------------------------------------------------------------------------------------------------
-- File Information Section
--
-- (C) COPYRIGHT 2018 ESG GmbH
-- ALL RIGHTS RESERVED
--
-- Filename 	: design.vhd
-- Author 		: Maximilian Moosrainer
-- Date 		: 31.01.2018
-- Description 	: This is an example design for a first introduction to UVVM
-- Revision 	: 0
-- Mod. History :	Date		By		Revision	Modification Description
-- 					31.01.2018 	Moox 	0 			Initial commit
------------------------------------------------------------------------------------------------------------------------

library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

-- This is an example design outputs the input word shifted to the right by one bit 
entity shifter is
	port(
		-- input
		port_clk_i : in std_logic;		-- 20 MHz system clock				
		port_reset_i : in std_logic;	-- synchronous, active high reset
		port_data_i : in std_logic_vector(7 downto 0);	-- data to be shifted
		-- output
		port_data_o : out std_logic_vector(7 downto 0) := (others => '0')	-- resulting data
	);
end entity shifter;

architecture rtl of shifter is
	
begin
	
	-- system process
	process(port_clk_i)
	begin
		if(rising_edge(port_clk_i)) then
			if(port_reset_i = '1') then
				 -- now reset the output
				port_data_o <= (others => '0');
			else
				port_data_o <= port_data_i srl 1;
				port_data_o(7) <= '0';
			end if;
		end if;
	end process;
	
end architecture rtl;
