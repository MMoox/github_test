library IEEE;
use IEEE.std_logic_1164.all;
use IEEE.numeric_std.all;

-- Test bench entity
entity shifter_tb is
end entity;


-- Test bench architecture
architecture func of shifter_tb is

	constant C_CLK_PERIOD : time := 10 ns;
	signal clk_i : std_logic := '0';
	signal reset_i : std_logic := '0';
	signal data_i : std_logic_vector(7 downto 0);
	signal data_o : std_logic_vector(7 downto 0);

	shared variable END_SIM : boolean := false;

  begin
  -----------------------------------------------------------------------------
  -- Instantiate DUT
  -----------------------------------------------------------------------------
  i_shifter: entity work.shifter
    port map (
      -- DSP interface and general control signals
      port_clk_i             => clk_i,
      port_reset_i            => reset_i,
      -- CPU interface
      port_data_i              => data_i,
      port_data_o            => data_o
  );
  ------------------------------------------------
  -- PROCESS: p_main
  ------------------------------------------------
  p_main: process
  begin
	wait for 0 ns;
	END_SIM := false;
	wait for 10 * C_CLK_PERIOD;
	data_i <= b"10101010";
	report "new data input: 0xAA";
	wait for 10 * C_CLK_PERIOD;
	data_i <= b"01010101";
	report "new data input: 0x55";
	data_i <= b"00001111";
	report "new data input: 0x0F";
	data_i <= b"11110000";
	report "new data input: 0x0F";
	END_SIM := true;
	wait;
  end process p_main;

  -- Toggle the reset after 5 clock periods
  p_arst: reset_i <= '1', '0' after 5 *C_CLK_PERIOD;

  -----------------------------------------------------------------------------
  -- Clock process
  -----------------------------------------------------------------------------  
  p_clk: process
  begin
    if(END_SIM = false) then
    	clk_i <= '0';
	wait for C_CLK_PERIOD / 2;
    	clk_i <= '1';
	wait for C_CLK_PERIOD / 2;
    else
	wait;
    end if;
  end process;

end func;
