import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";


export const getAllNotification=async(req, res)=>{
    try {
        const userId= req.user._id;
        const user= await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
        const notification= await Notification.find({to: userId}).populate({path: "from", select: "username profileImg"})
        await Notification.updateOne({to: userId, read: true}) 
        res.status(200).json(notification)

    } catch (error) {
        console.error(`Error on getAllNotification: ${error}`)
        res.status(500).json({ error: "internal server Error" })
    }
} 

export const deleteNotification=async(req, res)=>{
    try {
        const userId= req.user._id;
        const user= await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
        await Notification.deleteMany({to: userId})
        res.status(200).json({message: "Notification deleted successfully"})
        
    } catch (error) {
        console.error(`Error on deleteNotification: ${error}`)
        res.status(500).json({ error: "internal server Error" })
    }
} 
// export const deleteOneNotification=async(req, res)=>{
//     try {
//         const notificationId= req.params.id;
//         const userId = req.user._id;
//         const notification= await Notification.findById(notificationId);
//         if (!notification) {
//             return res.status(404).json({ error: "Notification not found" })
//         }
//         if(notification.to.toString() !==userId.toString){
//             return res.status(403).json({ error: "Your are not allow to delete this noticfication" })

//         }
//         await Notification.findByIdAndDelete(notification._id)
//         res.status(200).json({message: "Notification deleted successfully"})
        
//     } catch (error) {
//         console.error(`Error on deleteOneNotification: ${error}`)
//         res.status(500).json({ error: "internal server Error" })
//     }
// } 