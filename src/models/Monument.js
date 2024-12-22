'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Monument extends Model {
        static associate(models) {
            // Preparado para futuras relaciones
        }
    }
    
    Monument.init({
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 255]
            }
        },
        type: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [0, 100]
            }
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: false,
            validate: {
                min: -90,
                max: 90
            }
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: false,
            validate: {
                min: -180,
                max: 180
            }
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: [0, 500]
            }
        },
        osmId: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        lastSearched: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'Monument',
        tableName: 'monuments',
        timestamps: true,
        indexes: [
            {
                fields: ['osmId'],
                unique: true
            },
            {
                fields: ['latitude', 'longitude']
            }
        ]
    });

    return Monument;
};