const { SlashCommandBuilder, CommandInteraction } = require("discord.js");

const { CalculatorEntry } = require("../schemas");

const command = {
    /**
     * Command data
     * @type {SlashCommandBuilder}
     */
    data: new SlashCommandBuilder()
        .setName("candle")
        .setDescription("Base commands for candles")
        .addSubcommand(subcommand => subcommand
            .setName("calc")
            .setDescription("Simple calculator for candle creation")
            .addNumberOption(opt => opt
                .setName("container-size")
                .setDescription("The weight of wax in each container.")
                .setRequired(true)
                .setMinValue(1)
            )
            .addIntegerOption(opt => opt
                .setName("container-count")
                .setDescription("The number of containers, or set to 1 to just use the container size as the total weight.")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
            )
            .addNumberOption(opt => opt
                .setName("fragrance-percent")
                .setDescription("The percentage of fragrance to use. '10' => 10%")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(20)
            )
            .addStringOption(opt => opt
                .setName("unit")
                .setDescription("The unit to use. Default: Ounces")
                .setChoices(
                    {
                        name: "Ounces",
                        value: "oz",
                    },
                    {
                        name: "Grams",
                        value: "g",
                    },
                )
            )
            .addNumberOption(opt => opt
                .setName("buffer")
                .setDescription("Additional weight to add, if necessary.")
                .setRequired(false)
            )
            .addNumberOption(opt => opt
                .setName("multi-wax-percent")
                .setDescription("If using more than 1 wax, enter the usage of the first wax as a percent.")
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(99)
            )
            .addNumberOption(opt => opt
                .setName("multi-fragrance-percent")
                .setDescription("If using more than 1 fragrance, enter the usage of the first fragrance as a percent.")
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(99)
            )
        ),
    /**
     * Command executor
     * @param {CommandInteraction} interaction 
     */
    execute: async interaction => {
        const subcommand = interaction.options.getSubcommand(true);
        if (subcommand === "calc") {
            const containerSize = interaction.options.getNumber("container-size", true);
            const containerCount = interaction.options.getInteger("container-count", true);
            const fragrancePercent = interaction.options.getNumber("fragrance-percent", true);

            const buffer = interaction.options.getNumber("buffer", false);
            const multiWaxPercent = interaction.options.getNumber("multi-wax-percent", false);
            const multiFragPercent = interaction.options.getNumber("multi-fragrance-percent", false);

            let unit = interaction.options.getString("unit", false);
            
            let data = {
                containers: [
                    {
                        name: "Container",
                        size: containerSize,
                        quantity: containerCount,
                    }
                ],
                fragrancePercent,
                buffer,
            };

            if (unit) data.unit = unit;

            if (multiWaxPercent) {
                data.waxes = [
                    {
                        name: "Wax 1",
                        percent: multiWaxPercent,
                    },
                    {
                        name: "Wax 2",
                        percent: 100 - multiWaxPercent,
                    }
                ]
            }

            if (multiFragPercent) {
                data.fragrances = [
                    {
                        name: "Fragrance 1",
                        percent: multiFragPercent,
                    },
                    {
                        name: "Fragrance 2",
                        percent: 100 - multiFragPercent,
                    }
                ]
            }

            const entry = await CalculatorEntry.create(data);

            await entry.use();

            interaction.reply({
                embeds: [entry.embed()],
                ephemeral: true,
            });
        } else {
            interaction.error(`Unrecognized subcommand \`${subcommand}\`!`);
        }
    }
}

module.exports = command;
