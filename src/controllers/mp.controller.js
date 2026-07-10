const axios = require("axios"); 
const mpCtrl = {} 
 mpCtrl.getPaymentlink = async (req, res) => { 
    // Recibimos los datos reales que viajan desde la app
    const { payer_email, monto, idViaje } = req.body; 

    try { 
        const url = "https://api.mercadopago.com/checkout/preferences"; 
        const body = { 
          // Usamos el mail de la pasajera o uno de respaldo por defecto
          payer_email: payer_email || "pasajera@taxifem.com", 
          items: [ 
            { 
              id: idViaje ? idViaje.toString() : "1",
              title: `Servicio de Traslado TaxiFem #${idViaje || 'Prueba'}`, 
              description: "Viaje seguro en plataforma TaxiFem", 
              picture_url: "http://www.myapp.com/myimage.jpg", 
              category_id: "travel", 
              quantity: 1, 
              unit_price: monto ? parseFloat(monto) : 3500 // El precio dinámico calculado por tu app
            } 
          ], 
 
          back_urls: { 
            failure: "http://localhost:4200/pago/fallido", 
            pending: "http://localhost:4200/pago/pendiente", 
            success: "http://localhost:4200/pago/exitoso" 
          },
          auto_return: "approved",
          // Guardamos el ID del viaje acá para poder actualizar la BD al volver
          external_reference: idViaje ? idViaje.toString() : "0"
        }; 
 
        const payment = await axios.post(url, body, { 
          headers: { 
            "Content-Type": "application/json", 
            Authorization: `Bearer ${process.env.ACCESS_TOKEN}` 
          } 
        }); 
 
        return res.status(200).json(payment.data); 
 
    } catch (error) { 
        console.log(error); 
 
        return res.status(500).json({ 
            error: true, msg: "Failed to create payment"  
        }); 
    } 
}
 
mpCtrl.getSubscriptionLink = async (req, res) => { 
    //recibir en body info de payer_email, razon, cantidad 
    try { 
        const url = "https://api.mercadopago.com/preapproval"; 
 
        const body = { 
            reason: "Suscripción de ejemplo", 
            auto_recurring: { 
                frequency: 1, 
                frequency_type: "months", 
                transaction_amount: 10000, 
                currency_id: "ARS" 
            }, 
            back_url: "http://localhost:4200/returnpath", 
            payer_email: "payer_email@gmail.com@google.com" 
        }; 
 
        const subscription = await axios.post(url, body, { 
            headers: { 
                "Content-Type": "application/json", 
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}` 
            } 
        }); 
    return res.status(200).json(subscription.data); 
} catch (error) {  
    console.log(error); 
    return res.status(500).json({ 
        error: true, msg: "Failed to create subscription"  
        });         
    } 
} 
module.exports = mpCtrl; 
