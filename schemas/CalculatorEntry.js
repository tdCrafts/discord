const { EmbedBuilder, codeBlock } = require("discord.js");
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    containerSize: {
        type: Number,
        required: true,
    },
    containerCount: {
        type: Number,
        required: true,
    },
    buffer: {
        type: Number,
        default: null,
    },
    unit: {
        type: String,
        enum: ["g", "oz"],
        default: "oz",
    },
    fragrancePercent: {
        type: Number,
        default: 10,
    },
    waxes: {
        type: [{name: String, percent: Number}],
        default: [{name: "Wax 1", percent: 100}],
    },
    fragrances: {
        type: [{name: String, percent: Number}],
        default: [{name: "Fragrance 1", percent: 100}],
    },
    executed_at: {
        type: Date,
        default: Date.now,
    },
    last_used_at: {
        type: Date,
        default: Date.now,
    },
    uses: {
        type: Number,
        default: 0,
    }
}, {
    toJSON: {
        virtuals: true,
    }
});

schema.virtual("roundTo")
    .get(function() {
        return this.unit === "oz" ? 2 : 1;
    });

schema.virtual("totalProduct")
    .get(function() {
        return (this.containerSize * this.containerCount) + (this.buffer ? this.buffer : 0);
    });

schema.virtual("totalWax")
    .get(function() {
        return this.totalProduct * (100 - this.fragrancePercent) / 100;
    });

schema.virtual("totalFragrance")
    .get(function() {
        return this.totalProduct * this.fragrancePercent / 100;
    });

schema.virtual("url")
    .get(function() {
        return `${process.env.WEB_ROOT}calculator/${this._id}`;
    });

schema.methods.embed = function() {
    const embed = new EmbedBuilder()
        .setURL(this.url)
        .setAuthor({
            name: "View on the Web",
            url: this.url,
        })
        .setColor(0x29ab4c)
        .setTitle("Calculator Results")
        .setDescription(`Total Product:${codeBlock(this.totalProduct.toFixed(this.roundTo))}${this.containerCount > 1 ? `**Makes \`${this.containerCount}\` containers at \`${this.containerSize} ${this.unit}\` each${this.buffer ? ` with \`${this.buffer} ${this.unit}\` buffer` : ""}**` : ""}`);

    if (this.waxes.length > 1) {
        let waxBreakdown = "";
        this.waxes.forEach(wax => {
            waxBreakdown += `**${wax.name} (${wax.percent.toFixed(1)}%)**`;
            waxBreakdown += codeBlock((this.totalWax * wax.percent / 100).toFixed(this.roundTo));
        });
        embed.addFields({
            name: `Waxes (${(100 - this.fragrancePercent).toFixed(1)}%)`,
            value: codeBlock(this.totalWax.toFixed(this.roundTo)) + waxBreakdown,
            inline: true,
        })
    } else {
        embed.addFields({
            name: `Wax (${(100 - this.fragrancePercent).toFixed(1)}%)`,
            value: codeBlock(this.totalWax.toFixed(this.roundTo)),
            inline: true,
        })
    }

    if (this.fragrances.length > 1) {
        let fragranceBreakdown = "";
        this.fragrances.forEach(fragrance => {
            fragranceBreakdown += `**${fragrance.name} (${fragrance.percent.toFixed(1)}%)**`;
            fragranceBreakdown += codeBlock((this.totalFragrance * fragrance.percent / 100).toFixed(this.roundTo));
        });
        embed.addFields({
            name: `Fragrances (${this.fragrancePercent.toFixed(1)}%)`,
            value: codeBlock(this.totalFragrance.toFixed(this.roundTo)) + fragranceBreakdown,
            inline: true,
        })
    } else {
        embed.addFields({
            name: `Fragrance (${this.fragrancePercent.toFixed(1)}%)`,
            value: codeBlock(this.totalFragrance.toFixed(this.roundTo)),
            inline: true,
        })
    }

    return embed;
}

schema.methods.use = async function() {
    this.last_used_at = Date.now();
    this.uses++;
    await this.save();
};

module.exports = mongoose.model("CalculatorEntry", schema);
